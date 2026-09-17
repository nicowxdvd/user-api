/* eslint-disable @typescript-eslint/unbound-method */
import { FindPermissionsUseCase } from './find-permissions.use-case';
import type { PermissionRepositoryPort } from '../../domain/ports/out/permission-repository.port';
import { Permission } from '../../domain/entities/permission.entity';

describe('FindPermissionsUseCase', () => {
  let useCase: FindPermissionsUseCase;
  let repository: jest.Mocked<PermissionRepositoryPort>;

  beforeEach(() => {
    repository = {
      save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), findByIds: jest.fn(),
      updateStatus: jest.fn(), isAssignedToAnyRole: jest.fn(), delete: jest.fn(),
    };

    useCase = new FindPermissionsUseCase(repository);

  });

  it('delega el filtro isActive al repositorio', async () => {
    const permisos = [new Permission('users:list', undefined, true, 1)];
    repository.findAll.mockResolvedValue(permisos);

    const resultado = await useCase.execute(true);

    expect(repository.findAll).toHaveBeenCalledWith(true);
    expect(resultado).toBe(permisos);

  });
});
