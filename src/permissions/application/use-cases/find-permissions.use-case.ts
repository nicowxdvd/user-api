import { Inject, Injectable } from '@nestjs/common';
import { Permission } from '../../domain/entities/permission.entity';
import type { FindPermissionsPort } from '../../domain/ports/in/find-permissions.port';
import { PERMISSION_REPOSITORY_PORT } from '../../domain/ports/out/permission-repository.port';
import type { PermissionRepositoryPort } from '../../domain/ports/out/permission-repository.port';

@Injectable()
export class FindPermissionsUseCase implements FindPermissionsPort {

  constructor(@Inject(PERMISSION_REPOSITORY_PORT) private readonly permissionRepository: PermissionRepositoryPort) {}


  execute(isActive?: boolean): Promise<Permission[]> {
    return this.permissionRepository.findAll(isActive);

  }
}
