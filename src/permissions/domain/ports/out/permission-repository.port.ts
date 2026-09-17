import { Permission } from '../../entities/permission.entity';

export const PERMISSION_REPOSITORY_PORT = Symbol('PERMISSION_REPOSITORY_PORT');

export interface DeleteOutcome {
  affected?: number | null;
}

export interface PermissionRepositoryPort {
  save(permission: Permission): Promise<Permission>;
  findAll(isActive?: boolean): Promise<Permission[]>;
  findById(id: number): Promise<Permission | null>;
  findByIds(ids: number[]): Promise<Permission[]>;
  updateStatus(id: number, isActive: boolean): Promise<DeleteOutcome>;
  isAssignedToAnyRole(name: string): Promise<boolean>;
  delete(id: number): Promise<DeleteOutcome>;
}
