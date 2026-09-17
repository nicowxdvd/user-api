import { Inject, Injectable } from '@nestjs/common';
import { Permission } from '../../domain/entities/permission.entity';
import { PermissionName } from '../../domain/value-objects/permission-name.vo';
import type { CreatePermissionCommand, CreatePermissionPort } from '../../domain/ports/in/create-permission.port';
import { PERMISSION_REPOSITORY_PORT } from '../../domain/ports/out/permission-repository.port';
import type { PermissionRepositoryPort } from '../../domain/ports/out/permission-repository.port';

@Injectable()
export class CreatePermissionUseCase implements CreatePermissionPort {

  constructor(@Inject(PERMISSION_REPOSITORY_PORT) private readonly permissionRepository: PermissionRepositoryPort) {}


  async execute(command: CreatePermissionCommand): Promise<Permission> {
    const name       = PermissionName.create(command.name);
    const permission = new Permission(name.toString(), command.description);

    return this.permissionRepository.save(permission);

  }
}
