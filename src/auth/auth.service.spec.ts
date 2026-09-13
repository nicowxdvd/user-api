import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { AUTH_REPOSITORY_TOKEN, IAuthRepository } from './interfaces/auth-repository.interface';
import { User } from '../users/entities/user.entity';

jest.mock('bcrypt', () => ({ compare: jest.fn() }));

const bcryptCompare = bcrypt.compare as jest.Mock;

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: jest.Mocked<IAuthRepository>;
  let jwtService: { sign: jest.Mock };

  const usuarioActivo = { id: 'a1b2c3d4', email: 'nico@correo.com', password: 'hash-de-la-contrasena', isActive: true, roleId: 1, role: { id: 1, name: 'ADMIN' } } as User;

  beforeEach(async () => {
    authRepository = { findByEmailWithPassword: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('token-firmado') };

    const module: TestingModule = await Test.createTestingModule({ providers: [AuthService, { provide: AUTH_REPOSITORY_TOKEN, useValue: authRepository }, { provide: JwtService, useValue: jwtService }] }).compile();

    service = module.get<AuthService>(AuthService);
    bcryptCompare.mockReset();

  });

  it('should be defined', () => {
    expect(service).toBeDefined();

  });

  it('devuelve un access_token cuando las credenciales son válidas', async () => {
    authRepository.findByEmailWithPassword.mockResolvedValue(usuarioActivo);
    bcryptCompare.mockResolvedValue(true);

    const resultado = await service.login({ email: 'nico@correo.com', password: 'contrasena-correcta' });

    expect(resultado).toEqual({ access_token: 'token-firmado' });
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'a1b2c3d4', email: 'nico@correo.com', roleId: 1, role: 'ADMIN' });

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
});
