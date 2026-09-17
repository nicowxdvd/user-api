/* eslint-disable @typescript-eslint/unbound-method */
import { CreatePermissionUseCase } from './create-permission.use-case';
import type { PermissionRepositoryPort } from '../../domain/ports/out/permission-repository.port';
import { Permission } from '../../domain/entities/permission.entity';

describe('CreatePermissionUseCase', () => {
  let useCase: CreatePermissionUseCase;
  let repository: jest.Mocked<PermissionRepositoryPort>;

  beforeEach(() => {
    repository = {
      save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), findByIds: jest.fn(),
      updateStatus: jest.fn(), isAssignedToAnyRole: jest.fn(), delete: jest.fn(),
    };

    useCase = new CreatePermissionUseCase(repository);

  });

  it('recorta el nombre antes de guardarlo', async () => {
    repository.save.mockImplementation((permission) => Promise.resolve(permission));

    const resultado = await useCase.execute({ name: '  users:list  ', description: 'Listar usuarios' });

    expect(resultado.name).toBe('users:list');
    expect(repository.save).toHaveBeenCalledWith(expect.any(Permission));

  });
});
