import { Role } from '../../entities/role.entity';

export const CREATE_ROLE_PORT = Symbol('CREATE_ROLE_PORT');

export interface CreateRoleCommand {
  name: string;
  description?: string;
}

export interface CreateRolePort {
  execute(command: CreateRoleCommand): Promise<Role>;
}
