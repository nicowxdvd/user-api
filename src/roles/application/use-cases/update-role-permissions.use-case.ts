import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../../domain/entities/role.entity';
import type { UpdateRolePermissionsPort } from '../../domain/ports/in/update-role-permissions.port';
import { ROLE_REPOSITORY_PORT } from '../../domain/ports/out/role-repository.port';
import type { RoleRepositoryPort } from '../../domain/ports/out/role-repository.port';
import { PERMISSION_REPOSITORY_PORT } from '../../../permissions/domain/ports/out/permission-repository.port';
import type { PermissionRepositoryPort } from '../../../permissions/domain/ports/out/permission-repository.port';
import { PermisosNoEncontradosError, RolNoEncontradoError } from '../../domain/errors/role.errors';

@Injectable()
export class UpdateRolePermissionsUseCase implements UpdateRolePermissionsPort {

  constructor(
    @Inject(ROLE_REPOSITORY_PORT) private readonly roleRepository: RoleRepositoryPort,
    @Inject(PERMISSION_REPOSITORY_PORT) private readonly permissionRepository: PermissionRepositoryPort,
  ) {}


  async execute(id: number, permissionIds: number[]): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role)
      throw new RolNoEncontradoError(id);

    const permissions = await this.permissionRepository.findByIds(permissionIds);
    if (permissions.length !== permissionIds.length)
      throw new PermisosNoEncontradosError();

    return this.roleRepository.setPermissions(id, permissionIds);

  }
}
