import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { IAuthRepository } from '../interfaces/auth-repository.interface';

@Injectable()
export class AuthRepository implements IAuthRepository {

  constructor(@InjectRepository(User) private readonly typeormRepo: Repository<User>) {}


  async findByEmailWithPassword(email: string): Promise<User | null> {
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


  async findByEmail(email: string): Promise<Pick<User, 'id' | 'isActive'> | null> {
    return await this.typeormRepo.findOne({ where: { email }, select: { id: true, isActive: true } });
  }


}
