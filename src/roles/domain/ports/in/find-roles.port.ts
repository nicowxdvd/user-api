import { Role } from '../../entities/role.entity';

export const FIND_ROLES_PORT = Symbol('FIND_ROLES_PORT');

export interface FindRolesPort {
  execute(isActive?: boolean): Promise<Role[]>;
}
