import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../domain/entities/user.entity';
import type { DeleteOutcome, UserRepositoryPort, UsersCursor, UsersPage } from '../../../../domain/ports/out/user-repository.port';
import { UserOrmEntity } from './user.orm-entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserTypeormRepository implements UserRepositoryPort {

  constructor(@InjectRepository(UserOrmEntity) private readonly typeormRepo: Repository<UserOrmEntity>) {}


  async findAll(roleActive?: boolean, cursor?: UsersCursor, limit = 20): Promise<UsersPage> {
    const query = this.typeormRepo
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .select(['user.id', 'user.firstName', 'user.lastName', 'user.isActive', 'user.roleId', 'user.createdAt', 'user.updatedAt', 'role.id', 'role.name'])
      .orderBy('user.createdAt', 'ASC')
      .addOrderBy('user.id', 'ASC')
      .take(limit);

    if (roleActive !== undefined)
      query.andWhere('role.isActive = :roleActive', { roleActive });

    if (cursor)
      query.andWhere('(user.createdAt, user.id) > (:cursorCreatedAt, :cursorId)', { cursorCreatedAt: cursor.createdAt, cursorId: cursor.id });

    const rows       = await query.getMany();
    const data       = rows.map((row) => UserMapper.toSummary(row));
    const last       = rows.length === limit ? rows[rows.length - 1] : undefined;
    const nextCursor = last ? Buffer.from(`${last.createdAt!.toISOString()}|${last.id}`).toString('base64') : null;

    return { data, nextCursor };

  }


  async findById(id: string): Promise<User | null> {
    const user = await this.typeormRepo.findOneBy({ id });
    return user ? UserMapper.toDomain(user) : null;

  }


  async findByEmail(email: string): Promise<User | null> {
    const user = await this.typeormRepo.findOneBy({ email });
    return user ? UserMapper.toDomain(user) : null;

  }


  async save(user: User): Promise<User> {
    const saved = await this.typeormRepo.save(UserMapper.toPersistenceForCreate(user));
    return UserMapper.toDomain(saved);

  }


  async update(id: string, changes: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>): Promise<User | null> {
    await this.typeormRepo.update(id, changes);
    const user = await this.typeormRepo.findOneBy({ id });
    return user ? UserMapper.toDomain(user) : null;

  }


  async updateStatus(id: string, isActive: boolean): Promise<DeleteOutcome> {
    return await this.typeormRepo.update(id, { isActive });

  }


  async delete(id: string): Promise<DeleteOutcome> {
    return await this.typeormRepo.delete(id);

  }

}
