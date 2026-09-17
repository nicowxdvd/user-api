import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { QueryFailedFilter } from './shared/infrastructure/filters/query-failed.filter';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './roles/roles.module';
import { UserProfilesModule } from './user-profiles/user-profiles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    HealthModule,
    UsersModule,
    AuthModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }]),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'), // Si falla, usa 'root' por defecto
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    RolesModule,
    UserProfilesModule,
    PermissionsModule,
  ],
  providers: [
    // Red de seguridad con mensajes genéricos: ningún error del driver escapa
    // como 500 sin traducir. Se usa `useValue` y no `useClass` porque el
    // constructor recibe un objeto de mensajes que Nest no sabe inyectar.
    { provide: APP_FILTER, useValue: new QueryFailedFilter() },
  ],
})
export class AppModule {}
