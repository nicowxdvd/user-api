import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { IUserRepository, UsersCursor, UsersPage } from '../interface/user-repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {

  constructor(@InjectRepository(User) private readonly typeormRepo: Repository<User>) {}


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

    // Keyset: la página siguiente arranca después de la última fila vista, no en un offset.
    // Evita el escaneo y descarte que hace MySQL con OFFSET a medida que crece la tabla.
    if (cursor)
      query.andWhere('(user.createdAt, user.id) > (:cursorCreatedAt, :cursorId)', { cursorCreatedAt: cursor.createdAt, cursorId: cursor.id });

    const data = await query.getMany();
    const last = data.length === limit ? data[data.length - 1] : undefined;
    const nextCursor = last ? Buffer.from(`${last.createdAt!.toISOString()}|${last.id}`).toString('base64') : null;

    return { data, nextCursor };

  }


  async findById(id: string): Promise<User | null> {
    return await this.typeormRepo.findOneBy({ id });

  }


  async findByEmail(email: string): Promise<User | null> {
    return await this.typeormRepo.findOneBy({ email });

  }


  async save(user: Partial<User>): Promise<User> {
    return await this.typeormRepo.save(user);

  }


  async update(id: string, user: Partial<User>): Promise<User | null> {
    await this.typeormRepo.update(id, user);
    return await this.typeormRepo.findOneBy({ id });

  }


  async updateStatus(id: string, isActive: boolean): Promise<{ affected?: number | null }> {
    return await this.typeormRepo.update(id, { isActive });

  }


  async delete(id: string): Promise<DeleteResult> {
    return await this.typeormRepo.delete(id);

  }

}
