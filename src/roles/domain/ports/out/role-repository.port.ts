import { Role } from '../../entities/role.entity';

export const ROLE_REPOSITORY_PORT = Symbol('ROLE_REPOSITORY_PORT');

export interface DeleteOutcome {
  affected?: number | null;
}

export interface RoleRepositoryPort {
  save(role: Role): Promise<Role>;
  findAll(isActive?: boolean): Promise<Role[]>;
  findById(id: number): Promise<Role | null>;
  updateStatus(id: number, isActive: boolean): Promise<DeleteOutcome>;
  setPermissions(id: number, permissionIds: number[]): Promise<Role>;
  delete(id: number): Promise<DeleteOutcome>;
}
