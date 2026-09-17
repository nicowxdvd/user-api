import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import type { JwtPayload } from '../../../../../domain/jwt-payload';
import { IS_PUBLIC_KEY } from '../../../../../../shared/infrastructure/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private readonly jwtService: JwtService, private readonly reflector: Reflector) {}


  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

    if (isPublic)
      return true;

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader)
      throw new UnauthorizedException('No se proporcionó el token de acceso');

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token)
      throw new UnauthorizedException('El formato del token es inválido. Se espera: Bearer <token>');

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);

      request['user'] = payload;

      return true;
    } catch {
      throw new UnauthorizedException('El token es inválido o ha expirado');
    }

  }

}
