import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { AUTH_REPOSITORY_TOKEN, IAuthRepository } from './interfaces/auth-repository.interface';
import { PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN, IPasswordResetTokenRepository } from './interfaces/password-reset-token-repository.interface';
import { User } from '../users/entities/user.entity';
import type { UpdateResult } from 'typeorm';
import type { PasswordResetToken } from './entities/password-reset-token.entity';

jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn() }));

const bcryptCompare = bcrypt.compare as jest.Mock;
const bcryptHash    = bcrypt.hash as jest.Mock;

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: jest.Mocked<IAuthRepository>;
  let passwordResetTokenRepository: jest.Mocked<IPasswordResetTokenRepository>;
  let jwtService: { sign: jest.Mock };

  const usuarioActivo = { id: 'a1b2c3d4', email: 'nico@correo.com', password: 'hash-de-la-contrasena', isActive: true, roleId: 1, role: { id: 1, name: 'ADMIN' } } as User;

  beforeEach(async () => {
    authRepository = { findByEmailWithPassword: jest.fn(), updatePassword: jest.fn(), findByEmail: jest.fn() };
    passwordResetTokenRepository = { create: jest.fn(), findValidByHash: jest.fn(), markAsUsed: jest.fn(), invalidateAllForUser: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('token-firmado') };

    const module: TestingModule = await Test.createTestingModule({ providers: [AuthService, { provide: AUTH_REPOSITORY_TOKEN, useValue: authRepository }, { provide: PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN, useValue: passwordResetTokenRepository }, { provide: JwtService, useValue: jwtService }] }).compile();

    service = module.get<AuthService>(AuthService);
    bcryptCompare.mockReset();
    bcryptHash.mockReset();

  });

  it('should be defined', () => {
    expect(service).toBeDefined();

  });

  it('devuelve un access_token cuando las credenciales son válidas', async () => {
    authRepository.findByEmailWithPassword.mockResolvedValue(usuarioActivo);
    bcryptCompare.mockResolvedValue(true);

    const resultado = await service.login({ email: 'nico@correo.com', password: 'contrasena-correcta' });

    expect(resultado).toEqual({ access_token: 'token-firmado' });
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'a1b2c3d4', email: 'nico@correo.com', roleId: 1, role: 'ADMIN', permissions: [] });

  });


  it('incluye en el token solo los permisos activos del rol', async () => {
    const permisos = [{ id: 1, name: 'users:list', isActive: true }, { id: 2, name: 'users:delete', isActive: false }];
    authRepository.findByEmailWithPassword.mockResolvedValue({ ...usuarioActivo, role: { ...usuarioActivo.role, permissions: permisos } } as User);
    bcryptCompare.mockResolvedValue(true);

    await service.login({ email: 'nico@correo.com', password: 'contrasena-correcta' });

    expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ permissions: ['users:list'] }));

  });

  it('rechaza el login cuando el correo no existe', async () => {
    authRepository.findByEmailWithPassword.mockResolvedValue(null);

    await expect(service.login({ email: 'no-existe@correo.com', password: 'contrasena-correcta' })).rejects.toThrow(new UnauthorizedException('Credenciales inválidas'));

  });

  it('rechaza el login cuando la contraseña no coincide', async () => {
    authRepository.findByEmailWithPassword.mockResolvedValue(usuarioActivo);
    bcryptCompare.mockResolvedValue(false);

    await expect(service.login({ email: 'nico@correo.com', password: 'contrasena-incorrecta' })).rejects.toThrow(new UnauthorizedException('Credenciales inválidas'));
    expect(jwtService.sign).not.toHaveBeenCalled();

  });

  it('rechaza el login cuando el usuario está inactivo', async () => {
    authRepository.findByEmailWithPassword.mockResolvedValue({ ...usuarioActivo, isActive: false });
    bcryptCompare.mockResolvedValue(true);

    await expect(service.login({ email: 'nico@correo.com', password: 'contrasena-correcta' })).rejects.toThrow(new UnauthorizedException('El usuario está inactivo'));

  });

  it('no actualiza la contraseña si el token ya fue usado o expiró', async () => {
    passwordResetTokenRepository.findValidByHash.mockResolvedValue({ id: 'token-id', userId: 'a1b2c3d4' } as PasswordResetToken);
    passwordResetTokenRepository.markAsUsed.mockResolvedValue({ affected: 0 } as UpdateResult);

    const resultado = await service.resetPassword({ newPassword: 'NuevaClave123', token: 'a'.repeat(64) });

    expect(resultado).toEqual({ message: 'Contraseña creada' });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authRepository.updatePassword).not.toHaveBeenCalled();

  });

  it('actualiza la contraseña cuando el token es válido', async () => {
    passwordResetTokenRepository.findValidByHash.mockResolvedValue({ id: 'token-id', userId: 'a1b2c3d4' } as PasswordResetToken);
    passwordResetTokenRepository.markAsUsed.mockResolvedValue({ affected: 1 } as UpdateResult);
    bcryptHash.mockResolvedValue('hash-simulado');

    const resultado = await service.resetPassword({ newPassword: 'NuevaClave123', token: 'a'.repeat(64) });

    expect(resultado).toEqual({ message: 'Contraseña creada' });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authRepository.updatePassword).toHaveBeenCalledWith('a1b2c3d4', expect.any(String));

  });

});
