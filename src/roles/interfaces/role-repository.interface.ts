import { DeleteResult } from 'typeorm';
import { CreateRoleDto } from '../dto/create-role.dto';
import { Role } from '../entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';

export const ROLE_REPOSITORY_TOKEN = Symbol('ROLE_REPOSITORY_TOKEN');

export interface IRoleRepository {
  save(createRoleDto: CreateRoleDto)                    : Promise<Role>;
  findAll(isActive?: boolean)                           : Promise<Role[]>;
  findById(id: number)                                  : Promise<Role | null>;
  updateStatus(id: number, isActive: boolean)           : Promise<{ affected?: number | null }>;
  setPermissions(id: number, permissions: Permission[]) : Promise<Role>;
  delete(id: number)                                    : Promise<DeleteResult>;

}
