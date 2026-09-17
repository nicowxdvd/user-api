import { Inject, Injectable } from '@nestjs/common';
import type { TogglePermissionStatusPort, TogglePermissionStatusResult } from '../../domain/ports/in/toggle-permission-status.port';
import { PERMISSION_REPOSITORY_PORT } from '../../domain/ports/out/permission-repository.port';
import type { PermissionRepositoryPort } from '../../domain/ports/out/permission-repository.port';
import { PermisoNoEncontradoError } from '../../domain/errors/permission.errors';

@Injectable()
export class TogglePermissionStatusUseCase implements TogglePermissionStatusPort {

  constructor(@Inject(PERMISSION_REPOSITORY_PORT) private readonly permissionRepository: PermissionRepositoryPort) {}


  async execute(id: number): Promise<TogglePermissionStatusResult> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission)
      throw new PermisoNoEncontradoError(id);

    const newStatus = !permission.isActive;
    await this.permissionRepository.updateStatus(id, newStatus);

    return { message: `El permiso ahora está ${newStatus ? 'activo' : 'inactivo'}`, isActive: newStatus };

  }
}
