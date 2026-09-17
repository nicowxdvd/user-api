import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { AuthGuard } from '../../../../../auth/auth.guard';
import { PermissionsGuard } from '../../../../../auth/permissions.guard';
import { CREATE_USER_PORT } from '../../../../domain/ports/in/create-user.port';
import { FIND_USERS_PORT } from '../../../../domain/ports/in/find-users.port';
import { FIND_USER_BY_ID_PORT } from '../../../../domain/ports/in/find-user-by-id.port';
import { FIND_ME_PORT } from '../../../../domain/ports/in/find-me.port';
import { UPDATE_USER_PORT } from '../../../../domain/ports/in/update-user.port';
import { TOGGLE_USER_STATUS_PORT } from '../../../../domain/ports/in/toggle-user-status.port';
import { DELETE_USER_PORT } from '../../../../domain/ports/in/delete-user.port';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: CREATE_USER_PORT, useValue: { execute: jest.fn() } },
        { provide: FIND_USERS_PORT, useValue: { execute: jest.fn() } },
        { provide: FIND_USER_BY_ID_PORT, useValue: { execute: jest.fn() } },
        { provide: FIND_ME_PORT, useValue: { execute: jest.fn() } },
        { provide: UPDATE_USER_PORT, useValue: { execute: jest.fn() } },
        { provide: TOGGLE_USER_STATUS_PORT, useValue: { execute: jest.fn() } },
        { provide: DELETE_USER_PORT, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);

  });

  it('should be defined', () => {
    expect(controller).toBeDefined();

  });
});
