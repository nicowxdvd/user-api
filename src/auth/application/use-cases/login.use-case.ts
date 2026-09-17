import { Inject, Injectable } from '@nestjs/common';
import type { LoginPort, LoginCommand, LoginResult } from '../../domain/ports/in/login.port';
import { AUTH_REPOSITORY_PORT } from '../../domain/ports/out/auth-repository.port';
import type { AuthRepositoryPort } from '../../domain/ports/out/auth-repository.port';
import { PASSWORD_HASHER_PORT } from '../../../shared/domain/ports/password-hasher.port';
import type { PasswordHasherPort } from '../../../shared/domain/ports/password-hasher.port';
import { TOKEN_SIGNER_PORT } from '../../domain/ports/out/token-signer.port';
import type { TokenSignerPort } from '../../domain/ports/out/token-signer.port';
import { CredencialesInvalidasError, UsuarioInactivoError } from '../../domain/errors/auth.errors';
import type { JwtPayload } from '../../domain/jwt-payload';

@Injectable()
export class LoginUseCase implements LoginPort {

  constructor(
    @Inject(AUTH_REPOSITORY_PORT) private readonly authRepository: AuthRepositoryPort,
    @Inject(PASSWORD_HASHER_PORT) private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_SIGNER_PORT) private readonly tokenSigner: TokenSignerPort,
  ) {}


  async execute({ email, password }: LoginCommand): Promise<LoginResult> {
    const user = await this.authRepository.findByEmailWithPassword(email);
    if (!user)
      throw new CredencialesInvalidasError();

    const isPasswordValid = await this.passwordHasher.compare(password, user.password);
    if (!isPasswordValid)
      throw new CredencialesInvalidasError();

    if (!user.isActive)
      throw new UsuarioInactivoError();

    const permissions         = user.rolePermissions.filter((permission) => permission.isActive).map((permission) => permission.name);
    const payload: JwtPayload = { sub: user.id, email: user.email, roleId: user.roleId, role: user.roleName, permissions };

    return { access_token: this.tokenSigner.sign(payload) };

  }
}
