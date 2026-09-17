import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { SharedModule } from '../shared/shared.module';
import { UserOrmEntity } from './infrastructure/adapters/out/persistence/user.orm-entity';
import { UserTypeormRepository } from './infrastructure/adapters/out/persistence/user.typeorm.repository';
import { UsersController } from './infrastructure/adapters/in/http/users.controller';
import { USER_REPOSITORY_PORT } from './domain/ports/out/user-repository.port';
import { CREATE_USER_PORT } from './domain/ports/in/create-user.port';
import { FIND_USERS_PORT } from './domain/ports/in/find-users.port';
import { FIND_USER_BY_ID_PORT } from './domain/ports/in/find-user-by-id.port';
import { FIND_ME_PORT } from './domain/ports/in/find-me.port';
import { UPDATE_USER_PORT } from './domain/ports/in/update-user.port';
import { TOGGLE_USER_STATUS_PORT } from './domain/ports/in/toggle-user-status.port';
import { DELETE_USER_PORT } from './domain/ports/in/delete-user.port';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { FindUsersUseCase } from './application/use-cases/find-users.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { FindMeUseCase } from './application/use-cases/find-me.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { ToggleUserStatusUseCase } from './application/use-cases/toggle-user-status.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';

@Module({
  imports: [AuthModule, PermissionsModule, SharedModule, TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY_PORT, useClass: UserTypeormRepository },
    { provide: CREATE_USER_PORT, useClass: CreateUserUseCase },
    { provide: FIND_USERS_PORT, useClass: FindUsersUseCase },
    { provide: FIND_USER_BY_ID_PORT, useClass: FindUserByIdUseCase },
    { provide: FIND_ME_PORT, useClass: FindMeUseCase },
    { provide: UPDATE_USER_PORT, useClass: UpdateUserUseCase },
    { provide: TOGGLE_USER_STATUS_PORT, useClass: ToggleUserStatusUseCase },
    { provide: DELETE_USER_PORT, useClass: DeleteUserUseCase },
  ],
})
export class UsersModule {}
