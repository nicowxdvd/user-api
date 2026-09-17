/* eslint-disable @typescript-eslint/unbound-method */
import { CreateRoleUseCase } from './create-role.use-case';
import type { RoleRepositoryPort } from '../../domain/ports/out/role-repository.port';
import { Role } from '../../domain/entities/role.entity';

describe('CreateRoleUseCase', () => {
  let useCase: CreateRoleUseCase;
  let repository: jest.Mocked<RoleRepositoryPort>;

  beforeEach(() => {
    repository = {
      save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), updateStatus: jest.fn(), setPermissions: jest.fn(), delete: jest.fn(),
    };

    useCase = new CreateRoleUseCase(repository);

  });

  it('normaliza el nombre a mayúsculas antes de guardarlo', async () => {
    repository.save.mockImplementation((role) => Promise.resolve(role));

    const resultado = await useCase.execute({ name: '  admin  ', description: 'Administrador' });

    expect(resultado.name).toBe('ADMIN');
    expect(repository.save).toHaveBeenCalledWith(expect.any(Role));

  });
});
