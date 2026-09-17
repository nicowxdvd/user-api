import { Inject, Injectable } from '@nestjs/common';
import type { ResetPasswordPort, ResetPasswordCommand, ResetPasswordResult } from '../../domain/ports/in/reset-password.port';
import { AUTH_REPOSITORY_PORT } from '../../domain/ports/out/auth-repository.port';
import type { AuthRepositoryPort } from '../../domain/ports/out/auth-repository.port';
import { PASSWORD_RESET_TOKEN_REPOSITORY_PORT } from '../../domain/ports/out/password-reset-token-repository.port';
import type { PasswordResetTokenRepositoryPort } from '../../domain/ports/out/password-reset-token-repository.port';
import { TOKEN_GENERATOR_PORT } from '../../../shared/domain/ports/token-generator.port';
import type { TokenGeneratorPort } from '../../../shared/domain/ports/token-generator.port';
import { PASSWORD_HASHER_PORT } from '../../../shared/domain/ports/password-hasher.port';
import type { PasswordHasherPort } from '../../../shared/domain/ports/password-hasher.port';

const MENSAJE_RESPUESTA = 'Contraseña creada';

@Injectable()
export class ResetPasswordUseCase implements ResetPasswordPort {

  constructor(
    @Inject(AUTH_REPOSITORY_PORT) private readonly authRepository: AuthRepositoryPort,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY_PORT) private readonly tokenRepository: PasswordResetTokenRepositoryPort,
    @Inject(TOKEN_GENERATOR_PORT) private readonly tokenGenerator: TokenGeneratorPort,
    @Inject(PASSWORD_HASHER_PORT) private readonly passwordHasher: PasswordHasherPort,
  ) {}


  async execute({ newPassword, token }: ResetPasswordCommand): Promise<ResetPasswordResult> {
    const tokenHash = this.tokenGenerator.hash(token);
    const resetToken = await this.tokenRepository.findValidByHash(tokenHash);

    if (!resetToken)
      return { message: MENSAJE_RESPUESTA };

    const { affected } = await this.tokenRepository.markAsUsed(resetToken.id);
    if (!affected)
      return { message: MENSAJE_RESPUESTA };

    const hashedPassword = await this.passwordHasher.hash(newPassword);
    await this.authRepository.updatePassword(resetToken.userId, hashedPassword);

    return { message: MENSAJE_RESPUESTA };

  }
}
