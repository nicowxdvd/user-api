import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PERMISSIONS_KEY } from '../common/decorators/require-permissions.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { PERMISSION_REPOSITORY_TOKEN } from '../permissions/interfaces/permission-repository.interface';
import type { IPermissionRepository } from '../permissions/interfaces/permission-repository.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
    @Inject(PERMISSION_REPOSITORY_TOKEN) private readonly permissionRepository: IPermissionRepository,
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

    // Arranque en frío: mientras un permiso nunca se le asignó a ningún rol, el gate
    // queda abierto para que alguien pueda crearlo y otorgárselo a sí mismo. Apenas
    // ese permiso se asigna a un rol por primera vez, la puerta se cierra para siempre
    // salvo quien lo tenga.
    const yaConfigurados = await Promise.all(faltantes.map((permission) => this.permissionRepository.isAssignedToAnyRole(permission)));

    if (yaConfigurados.some(Boolean))
      throw new ForbiddenException('No tenés permiso para realizar esta acción');

    return true;

  }

}
