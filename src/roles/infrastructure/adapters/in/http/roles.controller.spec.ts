import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { AuthGuard } from '../../../../../auth/auth.guard';
import { PermissionsGuard } from '../../../../../auth/permissions.guard';
import { CREATE_ROLE_PORT } from '../../../../domain/ports/in/create-role.port';
import { FIND_ROLES_PORT } from '../../../../domain/ports/in/find-roles.port';
import { TOGGLE_ROLE_STATUS_PORT } from '../../../../domain/ports/in/toggle-role-status.port';
import { UPDATE_ROLE_PERMISSIONS_PORT } from '../../../../domain/ports/in/update-role-permissions.port';
import { DELETE_ROLE_PORT } from '../../../../domain/ports/in/delete-role.port';

describe('RolesController', () => {
  let controller: RolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        { provide: CREATE_ROLE_PORT, useValue: { execute: jest.fn() } },
        { provide: FIND_ROLES_PORT, useValue: { execute: jest.fn() } },
        { provide: TOGGLE_ROLE_STATUS_PORT, useValue: { execute: jest.fn() } },
        { provide: UPDATE_ROLE_PERMISSIONS_PORT, useValue: { execute: jest.fn() } },
        { provide: DELETE_ROLE_PORT, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RolesController>(RolesController);

  });

  it('should be defined', () => {
    expect(controller).toBeDefined();

  });
});
