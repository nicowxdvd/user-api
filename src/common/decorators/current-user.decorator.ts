import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

/**
 * Lee el payload del token que AuthGuard dejó en `request.user`.
 *
 * Sin argumento devuelve el payload completo; con una clave, solo ese campo:
 * `@CurrentUser() usuario: JwtPayload` o `@CurrentUser('sub') id: string`.
 *
 * Solo tiene sentido en rutas protegidas: en una ruta marcada con `@Public()`
 * el guard no adjunta nada y el valor llega `undefined`.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as JwtPayload | undefined;

    return data ? user?.[data] : user;
  },
);
