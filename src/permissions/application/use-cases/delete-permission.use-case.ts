import { Inject, Injectable } from '@nestjs/common';
import type { DeletePermissionPort, DeletePermissionResult } from '../../domain/ports/in/delete-permission.port';
import { PERMISSION_REPOSITORY_PORT } from '../../domain/ports/out/permission-repository.port';
import type { PermissionRepositoryPort } from '../../domain/ports/out/permission-repository.port';
import { PermisoNoEncontradoError } from '../../domain/errors/permission.errors';

@Injectable()
export class DeletePermissionUseCase implements DeletePermissionPort {

  constructor(@Inject(PERMISSION_REPOSITORY_PORT) private readonly permissionRepository: PermissionRepositoryPort) {}


  async execute(id: number): Promise<DeletePermissionResult> {
    const result = await this.permissionRepository.delete(id);
    if (!result.affected)
      throw new PermisoNoEncontradoError(id);

    return { message: `Permiso con ID ${id} eliminado exitosamente` };

  }
}
