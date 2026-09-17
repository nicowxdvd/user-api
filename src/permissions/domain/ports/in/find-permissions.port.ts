import { Permission } from '../../entities/permission.entity';

export const FIND_PERMISSIONS_PORT = Symbol('FIND_PERMISSIONS_PORT');

export interface FindPermissionsPort {
  execute(isActive?: boolean): Promise<Permission[]>;
}
