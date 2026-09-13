import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const usersService = {
      create: jest.fn(), findMe: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), update: jest.fn(),
      toggleStatus: jest.fn(), remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
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
