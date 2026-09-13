import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PERMISSION_REPOSITORY_TOKEN } from './interfaces/permission-repository.interface';
import { PermissionRepository } from './repositories/permission.repository';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Permission])],
  controllers: [PermissionsController],
  providers: [PermissionsService, { provide: PERMISSION_REPOSITORY_TOKEN, useClass: PermissionRepository }],
  exports: [PERMISSION_REPOSITORY_TOKEN],
})
export class PermissionsModule {}
