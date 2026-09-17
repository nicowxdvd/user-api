/* eslint-disable @typescript-eslint/unbound-method */
import { FindRolesUseCase } from './find-roles.use-case';
import type { RoleRepositoryPort } from '../../domain/ports/out/role-repository.port';
import { Role } from '../../domain/entities/role.entity';

describe('FindRolesUseCase', () => {
  let useCase: FindRolesUseCase;
  let repository: jest.Mocked<RoleRepositoryPort>;

  beforeEach(() => {
    repository = {
      save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), updateStatus: jest.fn(), setPermissions: jest.fn(), delete: jest.fn(),
    };

    useCase = new FindRolesUseCase(repository);

  });

  it('delega el filtro isActive al repositorio', async () => {
    const roles = [new Role('ADMIN', undefined, true, 1)];
    repository.findAll.mockResolvedValue(roles);

    const resultado = await useCase.execute(true);

    expect(repository.findAll).toHaveBeenCalledWith(true);
    expect(resultado).toBe(roles);

  });
});
