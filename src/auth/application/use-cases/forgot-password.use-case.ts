import { Inject, Injectable } from '@nestjs/common';
import type { ForgotPasswordPort, ForgotPasswordCommand, ForgotPasswordResult } from '../../domain/ports/in/forgot-password.port';
import { AUTH_REPOSITORY_PORT } from '../../domain/ports/out/auth-repository.port';
import type { AuthRepositoryPort } from '../../domain/ports/out/auth-repository.port';
import { PASSWORD_RESET_TOKEN_REPOSITORY_PORT } from '../../domain/ports/out/password-reset-token-repository.port';
import type { PasswordResetTokenRepositoryPort } from '../../domain/ports/out/password-reset-token-repository.port';
import { TOKEN_GENERATOR_PORT } from '../../../shared/domain/ports/token-generator.port';
import type { TokenGeneratorPort } from '../../../shared/domain/ports/token-generator.port';

const MIN_DURATION_MS   = 200;
const TOKEN_TTL_MS       = 30 * 60 * 1000;

@Injectable()
export class ForgotPasswordUseCase implements ForgotPasswordPort {

  constructor(
    @Inject(AUTH_REPOSITORY_PORT) private readonly authRepository: AuthRepositoryPort,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY_PORT) private readonly tokenRepository: PasswordResetTokenRepositoryPort,
    @Inject(TOKEN_GENERATOR_PORT) private readonly tokenGenerator: TokenGeneratorPort,
  ) {}


  async execute({ email }: ForgotPasswordCommand): Promise<ForgotPasswordResult> {
    const start = Date.now();

    const user = await this.authRepository.findByEmail(email);
    if (user?.id && user.isActive) {
      const token          = this.tokenGenerator.generate();
      const tokenHash      = this.tokenGenerator.hash(token);
      const expirationDate = new Date(Date.now() + TOKEN_TTL_MS);
      await this.tokenRepository.invalidateAllForUser(user.id);
      await this.tokenRepository.create(user.id, tokenHash, expirationDate);

    }

    const elapsed = Date.now() - start;
    if (elapsed < MIN_DURATION_MS) {
      await new Promise((resolve) => setTimeout(resolve, MIN_DURATION_MS - elapsed));
    }

    return { message: 'Correo enviado' };

  }
}
