/* eslint-disable @typescript-eslint/unbound-method */
import { ResetPasswordUseCase } from './reset-password.use-case';
import type { AuthRepositoryPort } from '../../domain/ports/out/auth-repository.port';
import type { PasswordResetTokenRepositoryPort } from '../../domain/ports/out/password-reset-token-repository.port';
import type { TokenGeneratorPort } from '../../../shared/domain/ports/token-generator.port';
import type { PasswordHasherPort } from '../../../shared/domain/ports/password-hasher.port';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let authRepository: jest.Mocked<AuthRepositoryPort>;
  let tokenRepository: jest.Mocked<PasswordResetTokenRepositoryPort>;
  let tokenGenerator: jest.Mocked<TokenGeneratorPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;

  beforeEach(() => {
    authRepository  = { findByEmailWithPassword: jest.fn(), findByEmail: jest.fn(), updatePassword: jest.fn() };
    tokenRepository = { create: jest.fn(), findValidByHash: jest.fn(), markAsUsed: jest.fn(), invalidateAllForUser: jest.fn() };
    tokenGenerator  = { generate: jest.fn(), hash: jest.fn().mockReturnValue('token-hasheado') };
    passwordHasher  = { hash: jest.fn().mockResolvedValue('hash-simulado'), compare: jest.fn() };

    useCase = new ResetPasswordUseCase(authRepository, tokenRepository, tokenGenerator, passwordHasher);

  });

  it('no actualiza la contraseña cuando el token no existe o expiró', async () => {
    tokenRepository.findValidByHash.mockResolvedValue(null);

    const resultado = await useCase.execute({ newPassword: 'NuevaClave123', token: 'a'.repeat(64) });

    expect(resultado).toEqual({ message: 'Contraseña creada' });
    expect(authRepository.updatePassword).not.toHaveBeenCalled();

  });

  it('no actualiza la contraseña si el token ya fue usado', async () => {
    tokenRepository.findValidByHash.mockResolvedValue({ id: 'token-id', userId: 'a1b2c3d4' });
    tokenRepository.markAsUsed.mockResolvedValue({ affected: 0 });

    const resultado = await useCase.execute({ newPassword: 'NuevaClave123', token: 'a'.repeat(64) });

    expect(resultado).toEqual({ message: 'Contraseña creada' });
    expect(authRepository.updatePassword).not.toHaveBeenCalled();

  });

  it('actualiza la contraseña cuando el token es válido', async () => {
    tokenRepository.findValidByHash.mockResolvedValue({ id: 'token-id', userId: 'a1b2c3d4' });
    tokenRepository.markAsUsed.mockResolvedValue({ affected: 1 });

    const resultado = await useCase.execute({ newPassword: 'NuevaClave123', token: 'a'.repeat(64) });

    expect(resultado).toEqual({ message: 'Contraseña creada' });
    expect(authRepository.updatePassword).toHaveBeenCalledWith('a1b2c3d4', 'hash-simulado');

  });

});
