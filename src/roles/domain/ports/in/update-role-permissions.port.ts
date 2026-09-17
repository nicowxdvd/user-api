import { Role } from '../../entities/role.entity';

export const UPDATE_ROLE_PERMISSIONS_PORT = Symbol('UPDATE_ROLE_PERMISSIONS_PORT');

export interface UpdateRolePermissionsPort {
  execute(id: number, permissionIds: number[]): Promise<Role>;
}
