import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from '../users/infrastructure/adapters/out/persistence/user.orm-entity';
import { AUTH_REPOSITORY_TOKEN } from './interfaces/auth-repository.interface';
import { AuthRepository } from './repositories/auth.repository';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN } from './interfaces/password-reset-token-repository.interface';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, PasswordResetToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({ secret: configService.get<string>('JWT_SECRET'), signOptions: { expiresIn: '1h' } }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: AUTH_REPOSITORY_TOKEN, useClass: AuthRepository }, { provide: PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN, useClass: PasswordResetTokenRepository }],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}