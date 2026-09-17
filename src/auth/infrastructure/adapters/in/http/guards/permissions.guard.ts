import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PERMISSIONS_KEY } from '../../../../../../shared/infrastructure/decorators/require-permissions.decorator';
import type { JwtPayload } from '../../../../../domain/jwt-payload';
import { PERMISSION_REPOSITORY_PORT } from '../../../../../../permissions/domain/ports/out/permission-repository.port';
import type { PermissionRepositoryPort } from '../../../../../../permissions/domain/ports/out/permission-repository.port';

@Injectable()
export class PermissionsGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
    @Inject(PERMISSION_REPOSITORY_PORT) private readonly permissionRepository: PermissionRepositoryPort,
  ) {}


  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions?.length)
      return true;

    const request = context.switchToHttp().getRequest<Request>();
    const userPermissions = (request['user'] as JwtPayload | undefined)?.permissions ?? [];

    const faltantes = requiredPermissions.filter((permission) => !userPermissions.includes(permission));

    if (!faltantes.length)
      return true;

    const yaConfigurados = await Promise.all(faltantes.map((permission) => this.permissionRepository.isAssignedToAnyRole(permission)));

    if (yaConfigurados.some(Boolean))
      throw new ForbiddenException('No tenés permiso para realizar esta acción');

    return true;

  }

}
