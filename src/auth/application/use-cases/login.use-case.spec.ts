/* eslint-disable @typescript-eslint/unbound-method */
import { LoginUseCase } from './login.use-case';
import type { AuthRepositoryPort, AuthUserSnapshot } from '../../domain/ports/out/auth-repository.port';
import type { PasswordHasherPort } from '../../../shared/domain/ports/password-hasher.port';
import type { TokenSignerPort } from '../../domain/ports/out/token-signer.port';
import { CredencialesInvalidasError, UsuarioInactivoError } from '../../domain/errors/auth.errors';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let authRepository: jest.Mocked<AuthRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;
  let tokenSigner: jest.Mocked<TokenSignerPort>;

  const usuarioActivo: AuthUserSnapshot = {
    id: 'a1b2c3d4', email: 'nico@correo.com', password: 'hash-de-la-contrasena', isActive: true,
    roleId: 1, roleName: 'ADMIN', rolePermissions: [],
  };

  beforeEach(() => {
    authRepository = { findByEmailWithPassword: jest.fn(), findByEmail: jest.fn(), updatePassword: jest.fn() };
    passwordHasher  = { hash: jest.fn(), compare: jest.fn() };
    tokenSigner     = { sign: jest.fn().mockReturnValue('token-firmado') };

    useCase = new LoginUseCase(authRepository, passwordHasher, tokenSigner);

  });

  it('devuelve un access_token cuando las credenciales son válidas', async () => {
    authRepository.findByEmailWithPassword.mockResolvedValue(usuarioActivo);
    passwordHasher.compare.mockResolvedValue(true);

    const resultado = await useCase.execute({ email: 'nico@correo.com', password: 'contrasena-correcta' });

    expect(resultado).toEqual({ access_token: 'token-firmado' });
    expect(tokenSigner.sign).toHaveBeenCalledWith({ sub: 'a1b2c3d4', email: 'nico@correo.com', roleId: 1, role: 'ADMIN', permissions: [] });

  });

  it('incluye en el token solo los permisos activos del rol', async () => {
    const permisos = [{ name: 'users:list', isActive: true }, { name: 'users:delete', isActive: false }];
    authRepository.findByEmailWithPassword.mockResolvedValue({ ...usuarioActivo, rolePermissions: permisos });
    passwordHasher.compare.mockResolvedValue(true);

    await useCase.execute({ email: 'nico@correo.com', password: 'contrasena-correcta' });

    expect(tokenSigner.sign).toHaveBeenCalledWith(expect.objectContaining({ permissions: ['users:list'] }));

  });

  it('rechaza el login cuando el correo no existe', async () => {
    authRepository.findByEmailWithPassword.mockResolvedValue(null);

    await expect(useCase.execute({ email: 'no-existe@correo.com', password: 'contrasena-correcta' })).rejects.toThrow(CredencialesInvalidasError);

  });

  it('rechaza el login cuando la contraseña no coincide', async () => {
    authRepository.findByEmailWithPassword.mockResolvedValue(usuarioActivo);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute({ email: 'nico@correo.com', password: 'contrasena-incorrecta' })).rejects.toThrow(CredencialesInvalidasError);
    expect(tokenSigner.sign).not.toHaveBeenCalled();

  });

  it('rechaza el login cuando el usuario está inactivo', async () => {
    authRepository.findByEmailWithPassword.mockResolvedValue({ ...usuarioActivo, isActive: false });
    passwordHasher.compare.mockResolvedValue(true);

    await expect(useCase.execute({ email: 'nico@correo.com', password: 'contrasena-correcta' })).rejects.toThrow(UsuarioInactivoError);

  });

});
