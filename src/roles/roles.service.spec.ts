import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { ROLE_REPOSITORY_TOKEN, type IRoleRepository } from './interfaces/role-repository.interface';
import { PERMISSION_REPOSITORY_TOKEN, type IPermissionRepository } from '../permissions/interfaces/permission-repository.interface';

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const roleRepository: jest.Mocked<IRoleRepository> = {
      save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), updateStatus: jest.fn(), setPermissions: jest.fn(), delete: jest.fn(),
    };
    const permissionRepository: jest.Mocked<IPermissionRepository> = {
      save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), findByIds: jest.fn(), updateStatus: jest.fn(), delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: ROLE_REPOSITORY_TOKEN, useValue: roleRepository },
        { provide: PERMISSION_REPOSITORY_TOKEN, useValue: permissionRepository },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();

  });
});
