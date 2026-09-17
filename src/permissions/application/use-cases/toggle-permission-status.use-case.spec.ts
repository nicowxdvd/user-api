/* eslint-disable @typescript-eslint/unbound-method */
import { TogglePermissionStatusUseCase } from './toggle-permission-status.use-case';
import type { PermissionRepositoryPort } from '../../domain/ports/out/permission-repository.port';
import { Permission } from '../../domain/entities/permission.entity';
import { PermisoNoEncontradoError } from '../../domain/errors/permission.errors';

describe('TogglePermissionStatusUseCase', () => {
  let useCase: TogglePermissionStatusUseCase;
  let repository: jest.Mocked<PermissionRepositoryPort>;

  beforeEach(() => {
    repository = {
      save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), findByIds: jest.fn(),
      updateStatus: jest.fn(), isAssignedToAnyRole: jest.fn(), delete: jest.fn(),
    };

    useCase = new TogglePermissionStatusUseCase(repository);

  });

  it('rechaza un permiso inexistente', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(99)).rejects.toThrow(PermisoNoEncontradoError);

    expect(repository.updateStatus).not.toHaveBeenCalled();

  });

  it('invierte el estado del permiso', async () => {
    repository.findById.mockResolvedValue(new Permission('users:list', undefined, true, 1));

    const resultado = await useCase.execute(1);

    expect(repository.updateStatus).toHaveBeenCalledWith(1, false);
    expect(resultado).toEqual({ message: 'El permiso ahora está inactivo', isActive: false });

  });
});
