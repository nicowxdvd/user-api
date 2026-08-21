import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../interface/user-repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly typeormRepo: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.typeormRepo.find({
      relations: {
        role: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        role: {
          id: true,
          name: true,
        },
      },
    });
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
}
