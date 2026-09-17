/* eslint-disable @typescript-eslint/unbound-method */
import { ForgotPasswordUseCase } from './forgot-password.use-case';
import type { AuthRepositoryPort } from '../../domain/ports/out/auth-repository.port';
import type { PasswordResetTokenRepositoryPort } from '../../domain/ports/out/password-reset-token-repository.port';
import type { TokenGeneratorPort } from '../../../shared/domain/ports/token-generator.port';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let authRepository: jest.Mocked<AuthRepositoryPort>;
  let tokenRepository: jest.Mocked<PasswordResetTokenRepositoryPort>;
  let tokenGenerator: jest.Mocked<TokenGeneratorPort>;

  beforeEach(() => {
    authRepository  = { findByEmailWithPassword: jest.fn(), findByEmail: jest.fn(), updatePassword: jest.fn() };
    tokenRepository = { create: jest.fn(), findValidByHash: jest.fn(), markAsUsed: jest.fn(), invalidateAllForUser: jest.fn() };
    tokenGenerator  = { generate: jest.fn().mockReturnValue('token-en-claro'), hash: jest.fn().mockReturnValue('token-hasheado') };

    useCase = new ForgotPasswordUseCase(authRepository, tokenRepository, tokenGenerator);

  });

  it('genera y guarda un token cuando el usuario existe y está activo', async () => {
    authRepository.findByEmail.mockResolvedValue({ id: 'a1b2c3d4', isActive: true });

    const resultado = await useCase.execute({ email: 'nico@correo.com' });

    expect(resultado).toEqual({ message: 'Correo enviado' });
    expect(tokenRepository.invalidateAllForUser).toHaveBeenCalledWith('a1b2c3d4');
    expect(tokenRepository.create).toHaveBeenCalledWith('a1b2c3d4', 'token-hasheado', expect.any(Date));

  });

  it('no genera token cuando el correo no existe, pero responde igual', async () => {
    authRepository.findByEmail.mockResolvedValue(null);

    const resultado = await useCase.execute({ email: 'no-existe@correo.com' });

    expect(resultado).toEqual({ message: 'Correo enviado' });
    expect(tokenRepository.create).not.toHaveBeenCalled();

  });

  it('no genera token cuando el usuario está inactivo, pero responde igual', async () => {
    authRepository.findByEmail.mockResolvedValue({ id: 'a1b2c3d4', isActive: false });

    const resultado = await useCase.execute({ email: 'nico@correo.com' });

    expect(resultado).toEqual({ message: 'Correo enviado' });
    expect(tokenRepository.create).not.toHaveBeenCalled();

  });

});
