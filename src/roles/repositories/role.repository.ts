import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly typeormRepo: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return await this.typeormRepo.find({});
  }

  async save(role: Partial<Role>): Promise<Role> {
    return await this.typeormRepo.save(role);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.typeormRepo.delete(id);
  }
}
