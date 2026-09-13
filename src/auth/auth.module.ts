import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AUTH_REPOSITORY_TOKEN } from './interfaces/auth-repository.interface';
import { AuthRepository } from './repositories/auth.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({ secret: configService.get<string>('JWT_SECRET'), signOptions: { expiresIn: '1h' } }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: AUTH_REPOSITORY_TOKEN, useClass: AuthRepository }],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
