import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PermissionOrmEntity } from './infrastructure/adapters/out/persistence/permission.orm-entity';
import { PermissionTypeormRepository } from './infrastructure/adapters/out/persistence/permission.typeorm.repository';
import { PermissionsController } from './infrastructure/adapters/in/http/permissions.controller';
import { PERMISSION_REPOSITORY_PORT } from './domain/ports/out/permission-repository.port';
import { CREATE_PERMISSION_PORT } from './domain/ports/in/create-permission.port';
import { FIND_PERMISSIONS_PORT } from './domain/ports/in/find-permissions.port';
import { TOGGLE_PERMISSION_STATUS_PORT } from './domain/ports/in/toggle-permission-status.port';
import { DELETE_PERMISSION_PORT } from './domain/ports/in/delete-permission.port';
import { CreatePermissionUseCase } from './application/use-cases/create-permission.use-case';
import { FindPermissionsUseCase } from './application/use-cases/find-permissions.use-case';
import { TogglePermissionStatusUseCase } from './application/use-cases/toggle-permission-status.use-case';
import { DeletePermissionUseCase } from './application/use-cases/delete-permission.use-case';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([PermissionOrmEntity])],
  controllers: [PermissionsController],
  providers: [
    { provide: PERMISSION_REPOSITORY_PORT, useClass: PermissionTypeormRepository },
    { provide: CREATE_PERMISSION_PORT, useClass: CreatePermissionUseCase },
    { provide: FIND_PERMISSIONS_PORT, useClass: FindPermissionsUseCase },
    { provide: TOGGLE_PERMISSION_STATUS_PORT, useClass: TogglePermissionStatusUseCase },
    { provide: DELETE_PERMISSION_PORT, useClass: DeletePermissionUseCase },
  ],
  exports: [PERMISSION_REPOSITORY_PORT],
})
export class PermissionsModule {}
