import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { IRoleRepository } from '../interfaces/role-repository.interface';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly typeormRepo: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return await this.typeormRepo.find({});
  }

  async save(createRoleDto: CreateRoleDto): Promise<Role> {
    return await this.typeormRepo.save(createRoleDto);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.typeormRepo.delete(id);
  }
}
