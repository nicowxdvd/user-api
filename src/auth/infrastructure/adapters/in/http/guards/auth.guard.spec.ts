import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: { verify: jest.Mock };
  let reflector: { getAllAndOverride: jest.Mock };

  const contextConHeader = (authorization?: string): ExecutionContext => {
    const request = { headers: { authorization } };
    return {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

  };

  beforeEach(() => {
    jwtService = { verify: jest.fn() };
    reflector  = { getAllAndOverride: jest.fn() };

    guard = new AuthGuard(jwtService as never, reflector as never);

  });

  it('deja pasar las rutas públicas sin revisar el token', () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    expect(guard.canActivate(contextConHeader())).toBe(true);
    expect(jwtService.verify).not.toHaveBeenCalled();

  });

  it('rechaza cuando no se envía el header de autorización', () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    expect(() => guard.canActivate(contextConHeader())).toThrow(UnauthorizedException);

  });

  it('rechaza cuando el header no tiene el formato Bearer <token>', () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    expect(() => guard.canActivate(contextConHeader('Token abc'))).toThrow(UnauthorizedException);

  });

  it('permite pasar y adjunta el payload cuando el token es válido', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verify.mockReturnValue({ sub: 'a1b2c3d4', email: 'nico@correo.com' });

    const context = contextConHeader('Bearer token-valido');
    expect(guard.canActivate(context)).toBe(true);

  });

  it('rechaza cuando el token es inválido o expiró', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verify.mockImplementation(() => { throw new Error('expirado'); });

    expect(() => guard.canActivate(contextConHeader('Bearer token-vencido'))).toThrow(UnauthorizedException);

  });

});
