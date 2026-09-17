 
import { DeletePermissionUseCase } from './delete-permission.use-case';
import type { PermissionRepositoryPort } from '../../domain/ports/out/permission-repository.port';
import { PermisoNoEncontradoError } from '../../domain/errors/permission.errors';

describe('DeletePermissionUseCase', () => {
  let useCase: DeletePermissionUseCase;
  let repository: jest.Mocked<PermissionRepositoryPort>;

  beforeEach(() => {
    repository = {
      save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), findByIds: jest.fn(),
      updateStatus: jest.fn(), isAssignedToAnyRole: jest.fn(), delete: jest.fn(),
    };

    useCase = new DeletePermissionUseCase(repository);

  });

  it('rechaza un permiso inexistente', async () => {
    repository.delete.mockResolvedValue({ affected: 0 });

    await expect(useCase.execute(99)).rejects.toThrow(PermisoNoEncontradoError);

  });

  it('elimina el permiso existente', async () => {
    repository.delete.mockResolvedValue({ affected: 1 });

    const resultado = await useCase.execute(1);

    expect(resultado).toEqual({ message: 'Permiso con ID 1 eliminado exitosamente' });

  });
});
