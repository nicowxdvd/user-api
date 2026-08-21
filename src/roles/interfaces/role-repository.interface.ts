import { DeleteResult } from 'typeorm';
import { CreateRoleDto } from '../dto/create-role.dto';
import { Role } from '../entities/role.entity';

export const ROLE_REPOSITORY_TOKEN = Symbol('ROLE_REPOSITORY_TOKEN');

export interface IRoleRepository {
  save(createRoleDto: CreateRoleDto): Promise<Role>;
  findAll(): Promise<Role[]>;
  delete(id: number): Promise<DeleteResult>;
}
