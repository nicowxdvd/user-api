 
import { DeleteRoleUseCase } from './delete-role.use-case';
import type { RoleRepositoryPort } from '../../domain/ports/out/role-repository.port';
import { RolNoEncontradoError } from '../../domain/errors/role.errors';

describe('DeleteRoleUseCase', () => {
  let useCase: DeleteRoleUseCase;
  let repository: jest.Mocked<RoleRepositoryPort>;

  beforeEach(() => {
    repository = {
      save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), updateStatus: jest.fn(), setPermissions: jest.fn(), delete: jest.fn(),
    };

    useCase = new DeleteRoleUseCase(repository);

  });

  it('rechaza un rol inexistente', async () => {
    repository.delete.mockResolvedValue({ affected: 0 });

    await expect(useCase.execute(99)).rejects.toThrow(RolNoEncontradoError);

  });

  it('elimina el rol existente', async () => {
    repository.delete.mockResolvedValue({ affected: 1 });

    const resultado = await useCase.execute(1);

    expect(resultado).toEqual({ message: 'Rol con ID 1 eliminado exitosamente' });

  });
});
