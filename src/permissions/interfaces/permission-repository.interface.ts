import { DeleteResult } from 'typeorm';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { Permission } from '../entities/permission.entity';

export const PERMISSION_REPOSITORY_TOKEN = Symbol('PERMISSION_REPOSITORY_TOKEN');

export interface IPermissionRepository {
  save(createPermissionDto: CreatePermissionDto)     : Promise<Permission>;
  findAll(isActive?: boolean)                        : Promise<Permission[]>;
  findById(id: number)                               : Promise<Permission | null>;
  findByIds(ids: number[])                           : Promise<Permission[]>;
  updateStatus(id: number, isActive: boolean)        : Promise<{ affected?: number | null }>;
  isAssignedToAnyRole(name: string)                  : Promise<boolean>;
  delete(id: number)                                 : Promise<DeleteResult>;

}
