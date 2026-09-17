import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { RoleOrmEntity } from './infrastructure/adapters/out/persistence/role.orm-entity';
import { RoleTypeormRepository } from './infrastructure/adapters/out/persistence/role.typeorm.repository';
import { RolesController } from './infrastructure/adapters/in/http/roles.controller';
import { ROLE_REPOSITORY_PORT } from './domain/ports/out/role-repository.port';
import { CREATE_ROLE_PORT } from './domain/ports/in/create-role.port';
import { FIND_ROLES_PORT } from './domain/ports/in/find-roles.port';
import { TOGGLE_ROLE_STATUS_PORT } from './domain/ports/in/toggle-role-status.port';
import { UPDATE_ROLE_PERMISSIONS_PORT } from './domain/ports/in/update-role-permissions.port';
import { DELETE_ROLE_PORT } from './domain/ports/in/delete-role.port';
import { CreateRoleUseCase } from './application/use-cases/create-role.use-case';
import { FindRolesUseCase } from './application/use-cases/find-roles.use-case';
import { ToggleRoleStatusUseCase } from './application/use-cases/toggle-role-status.use-case';
import { UpdateRolePermissionsUseCase } from './application/use-cases/update-role-permissions.use-case';
import { DeleteRoleUseCase } from './application/use-cases/delete-role.use-case';

@Module({
  imports: [AuthModule, PermissionsModule, TypeOrmModule.forFeature([RoleOrmEntity])],
  controllers: [RolesController],
  providers: [
    { provide: ROLE_REPOSITORY_PORT, useClass: RoleTypeormRepository },
    { provide: CREATE_ROLE_PORT, useClass: CreateRoleUseCase },
    { provide: FIND_ROLES_PORT, useClass: FindRolesUseCase },
    { provide: TOGGLE_ROLE_STATUS_PORT, useClass: ToggleRoleStatusUseCase },
    { provide: UPDATE_ROLE_PERMISSIONS_PORT, useClass: UpdateRolePermissionsUseCase },
    { provide: DELETE_ROLE_PORT, useClass: DeleteRoleUseCase },
  ],
})
export class RolesModule {}
