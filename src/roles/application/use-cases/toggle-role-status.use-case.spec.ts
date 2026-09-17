/* eslint-disable @typescript-eslint/unbound-method */
import { ToggleRoleStatusUseCase } from './toggle-role-status.use-case';
import type { RoleRepositoryPort } from '../../domain/ports/out/role-repository.port';
import { Role } from '../../domain/entities/role.entity';
import { RolNoEncontradoError } from '../../domain/errors/role.errors';

describe('ToggleRoleStatusUseCase', () => {
  let useCase: ToggleRoleStatusUseCase;
  let repository: jest.Mocked<RoleRepositoryPort>;

  beforeEach(() => {
    repository = {
      save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), updateStatus: jest.fn(), setPermissions: jest.fn(), delete: jest.fn(),
    };

    useCase = new ToggleRoleStatusUseCase(repository);

  });

  it('rechaza un rol inexistente', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(99)).rejects.toThrow(RolNoEncontradoError);

    expect(repository.updateStatus).not.toHaveBeenCalled();

  });

  it('invierte el estado del rol', async () => {
    repository.findById.mockResolvedValue(new Role('ADMIN', undefined, true, 1));

    const resultado = await useCase.execute(1);

    expect(repository.updateStatus).toHaveBeenCalledWith(1, false);
    expect(resultado).toEqual({ message: 'El rol ahora está inactivo', isActive: false });

  });
});
