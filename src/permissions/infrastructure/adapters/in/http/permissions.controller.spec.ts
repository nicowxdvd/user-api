import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { AuthGuard } from '../../../../../auth/infrastructure/adapters/in/http/guards/auth.guard';
import { PermissionsGuard } from '../../../../../auth/infrastructure/adapters/in/http/guards/permissions.guard';
import { CREATE_PERMISSION_PORT } from '../../../../domain/ports/in/create-permission.port';
import { FIND_PERMISSIONS_PORT } from '../../../../domain/ports/in/find-permissions.port';
import { TOGGLE_PERMISSION_STATUS_PORT } from '../../../../domain/ports/in/toggle-permission-status.port';
import { DELETE_PERMISSION_PORT } from '../../../../domain/ports/in/delete-permission.port';

describe('PermissionsController', () => {
  let controller: PermissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        { provide: CREATE_PERMISSION_PORT, useValue: { execute: jest.fn() } },
        { provide: FIND_PERMISSIONS_PORT, useValue: { execute: jest.fn() } },
        { provide: TOGGLE_PERMISSION_STATUS_PORT, useValue: { execute: jest.fn() } },
        { provide: DELETE_PERMISSION_PORT, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PermissionsController>(PermissionsController);

  });

  it('should be defined', () => {
    expect(controller).toBeDefined();

  });
});
