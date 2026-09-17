import { Role } from '../../../../../domain/entities/role.entity';

export class RoleResponse {
  id: number;
  name: string;
  description: string | undefined;
  isActive: boolean;
  permissions: { id: number; name: string }[] | undefined;

  static fromDomain(role: Role): RoleResponse {
    const response       = new RoleResponse();
    response.id          = role.id!;
    response.name        = role.name;
    response.description = role.description;
    response.isActive    = role.isActive;
    response.permissions = role.permissions;

    return response;

  }
}
