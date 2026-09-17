import { Permission } from '../../entities/permission.entity';

export const CREATE_PERMISSION_PORT = Symbol('CREATE_PERMISSION_PORT');

export interface CreatePermissionCommand {
  name: string;
  description?: string;
}

export interface CreatePermissionPort {
  execute(command: CreatePermissionCommand): Promise<Permission>;
}
