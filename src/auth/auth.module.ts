import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from '../users/infrastructure/adapters/out/persistence/user.orm-entity';
import { SharedModule } from '../shared/shared.module';
import { AuthController } from './infrastructure/adapters/in/http/auth.controller';
import { PasswordResetTokenOrmEntity } from './infrastructure/adapters/out/persistence/password-reset-token.orm-entity';
import { AuthTypeormRepository } from './infrastructure/adapters/out/persistence/auth.typeorm.repository';
import { PasswordResetTokenTypeormRepository } from './infrastructure/adapters/out/persistence/password-reset-token.typeorm.repository';
import { JwtTokenSignerAdapter } from './infrastructure/adapters/out/security/jwt-token-signer.adapter';
import { AUTH_REPOSITORY_PORT } from './domain/ports/out/auth-repository.port';
import { PASSWORD_RESET_TOKEN_REPOSITORY_PORT } from './domain/ports/out/password-reset-token-repository.port';
import { TOKEN_SIGNER_PORT } from './domain/ports/out/token-signer.port';
import { LOGIN_PORT } from './domain/ports/in/login.port';
import { FORGOT_PASSWORD_PORT } from './domain/ports/in/forgot-password.port';
import { RESET_PASSWORD_PORT } from './domain/ports/in/reset-password.port';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([UserOrmEntity, PasswordResetTokenOrmEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({ secret: configService.get<string>('JWT_SECRET'), signOptions: { expiresIn: '1h' } }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: AUTH_REPOSITORY_PORT, useClass: AuthTypeormRepository },
    { provide: PASSWORD_RESET_TOKEN_REPOSITORY_PORT, useClass: PasswordResetTokenTypeormRepository },
    { provide: TOKEN_SIGNER_PORT, useClass: JwtTokenSignerAdapter },
    { provide: LOGIN_PORT, useClass: LoginUseCase },
    { provide: FORGOT_PASSWORD_PORT, useClass: ForgotPasswordUseCase },
    { provide: RESET_PASSWORD_PORT, useClass: ResetPasswordUseCase },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
