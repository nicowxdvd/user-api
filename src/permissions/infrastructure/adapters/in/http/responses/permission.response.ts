import { Permission } from '../../../../../domain/entities/permission.entity';

export class PermissionResponse {
  id: number;
  name: string;
  description: string | undefined;
  isActive: boolean;

  static fromDomain(permission: Permission): PermissionResponse {
    const response        = new PermissionResponse();
    response.id           = permission.id!;
    response.name         = permission.name;
    response.description  = permission.description;
    response.isActive     = permission.isActive;

    return response;

  }
}
