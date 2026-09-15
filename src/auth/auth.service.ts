import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginResponse } from './interfaces/login-response.interface';
import { AUTH_REPOSITORY_TOKEN, type IAuthRepository } from './interfaces/auth-repository.interface';
import { PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN, type IPasswordResetTokenRepository } from './interfaces/password-reset-token-repository.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { createHash, randomBytes } from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {

  constructor(
    private readonly jwtService: JwtService,
    @Inject(AUTH_REPOSITORY_TOKEN) private readonly authRepository: IAuthRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN) private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
  ) {}


  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const { email, password } = loginUserDto;

    const user = await this.authRepository.findByEmailWithPassword(email);
    if (!user?.password || !user.id || !user.email)
      throw new UnauthorizedException('Credenciales inválidas');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Credenciales inválidas');

    if (!user.isActive)
      throw new UnauthorizedException('El usuario está inactivo');

    const permissions         = user.role?.permissions?.filter((permission) => permission.isActive).map((permission) => permission.name) ?? [];
    const payload: JwtPayload = { sub: user.id, email: user.email, roleId: user.roleId, role: user.role?.name, permissions };

    return { access_token: this.jwtService.sign(payload) };

  }


  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.authRepository.findByEmailWithPassword(email);
    if (user?.id && user.isActive) {
      await this.passwordResetTokenRepository.invalidateAllForUser(user.id);

      const token          = randomBytes(32).toString('hex');
      const tokenHash      = createHash('sha256').update(token).digest('hex');
      const expirationDate = new Date(Date.now() + 30 * 60 * 1000);
      await this.passwordResetTokenRepository.create(user.id, tokenHash, expirationDate);

    }

    return { message: 'Correo enviado' };

  }


  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { newPassword, token } = resetPasswordDto;
    const newTokenHash           = createHash('sha256').update(token).digest('hex');
    const resetToken             = await this.passwordResetTokenRepository.findValidByHash(newTokenHash);

    if (!resetToken?.userId || !resetToken.id)
      return { message: 'Contraseña creada' };

    const { affected } = await this.passwordResetTokenRepository.markAsUsed(resetToken.id);
    if (!affected)
      return { message: 'Contraseña creada' };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.authRepository.updatePassword(resetToken.userId, hashedPassword);

    return { message: 'Contraseña creada' };

  }

}
