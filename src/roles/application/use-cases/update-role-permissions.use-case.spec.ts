/* eslint-disable @typescript-eslint/unbound-method */
import { UpdateRolePermissionsUseCase } from './update-role-permissions.use-case';
import type { RoleRepositoryPort } from '../../domain/ports/out/role-repository.port';
import type { PermissionRepositoryPort } from '../../../permissions/domain/ports/out/permission-repository.port';
import { Role } from '../../domain/entities/role.entity';
import { Permission } from '../../../permissions/domain/entities/permission.entity';
import { PermisosNoEncontradosError, RolNoEncontradoError } from '../../domain/errors/role.errors';

describe('UpdateRolePermissionsUseCase', () => {
  let useCase: UpdateRolePermissionsUseCase;
  let roleRepository: jest.Mocked<RoleRepositoryPort>;
  let permissionRepository: jest.Mocked<PermissionRepositoryPort>;

  beforeEach(() => {
    roleRepository = {
      save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), updateStatus: jest.fn(), setPermissions: jest.fn(), delete: jest.fn(),
    };
    permissionRepository = {
      save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), findByIds: jest.fn(),
      updateStatus: jest.fn(), isAssignedToAnyRole: jest.fn(), delete: jest.fn(),
    };

    useCase = new UpdateRolePermissionsUseCase(roleRepository, permissionRepository);

  });

  it('rechaza un rol inexistente', async () => {
    roleRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(1, [1, 2])).rejects.toThrow(RolNoEncontradoError);

    expect(permissionRepository.findByIds).not.toHaveBeenCalled();

  });

  it('rechaza si algún permiso indicado no existe', async () => {
    roleRepository.findById.mockResolvedValue(new Role('ADMIN', undefined, true, 1));
    permissionRepository.findByIds.mockResolvedValue([new Permission('users:list', undefined, true, 1)]);

    await expect(useCase.execute(1, [1, 2])).rejects.toThrow(PermisosNoEncontradosError);

    expect(roleRepository.setPermissions).not.toHaveBeenCalled();

  });

  it('asigna los permisos cuando todos existen', async () => {
    const role = new Role('ADMIN', undefined, true, 1, [{ id: 1, name: 'users:list' }]);
    roleRepository.findById.mockResolvedValue(new Role('ADMIN', undefined, true, 1));
    permissionRepository.findByIds.mockResolvedValue([new Permission('users:list', undefined, true, 1)]);
    roleRepository.setPermissions.mockResolvedValue(role);

    const resultado = await useCase.execute(1, [1]);

    expect(roleRepository.setPermissions).toHaveBeenCalledWith(1, [1]);
    expect(resultado).toBe(role);

  });
});
