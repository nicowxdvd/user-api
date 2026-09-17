import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { UserOrmEntity } from '../../users/infrastructure/adapters/out/persistence/user.orm-entity';
import { IAuthRepository } from '../interfaces/auth-repository.interface';

@Injectable()
export class AuthRepository implements IAuthRepository {

  constructor(@InjectRepository(UserOrmEntity) private readonly typeormRepo: Repository<UserOrmEntity>) {}


  async findByEmailWithPassword(email: string): Promise<UserOrmEntity | null> {
    return await this.typeormRepo.findOne({
      where: { email },
      relations: { role: { permissions: true } },
      select: {
        id: true, email: true, password: true, isActive: true, roleId: true,
        role: { id: true, name: true, isActive: true, permissions: { id: true, name: true, isActive: true } },
      },
    });

  }


  async updatePassword(userId: string, hashedPassword: string): Promise<UpdateResult> {
    return await this.typeormRepo.update(userId, { password: hashedPassword });

  }


  async findByEmail(email: string): Promise<Pick<UserOrmEntity, 'id' | 'isActive'> | null> {
    return await this.typeormRepo.findOne({ where: { email }, select: { id: true, isActive: true } });
  }


}
