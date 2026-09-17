/* eslint-disable @typescript-eslint/unbound-method */
import { ToggleUserStatusUseCase } from './toggle-user-status.use-case';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';
import { UsuarioNoEncontradoError } from '../../domain/errors/user.errors';
import { User } from '../../domain/entities/user.entity';

describe('ToggleUserStatusUseCase', () => {
  let useCase: ToggleUserStatusUseCase;
  let repository: jest.Mocked<UserRepositoryPort>;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(), findById: jest.fn(), findByEmail: jest.fn(), save: jest.fn(), update: jest.fn(),
      updateStatus: jest.fn(), delete: jest.fn(),
    };

    useCase = new ToggleUserStatusUseCase(repository);

  });

  it('lanza UsuarioNoEncontradoError cuando el usuario no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('99')).rejects.toThrow(UsuarioNoEncontradoError);

  });

  it('activa un usuario inactivo', async () => {
    repository.findById.mockResolvedValue(new User('ana@test.com', 'hash', 'Ana', 'Gomez', 11, false, '1'));

    const resultado = await useCase.execute('1');

    expect(repository.updateStatus).toHaveBeenCalledWith('1', true);
    expect(resultado.isActive).toBe(true);

  });

  it('desactiva un usuario activo', async () => {
    repository.findById.mockResolvedValue(new User('ana@test.com', 'hash', 'Ana', 'Gomez', 11, true, '1'));

    const resultado = await useCase.execute('1');

    expect(repository.updateStatus).toHaveBeenCalledWith('1', false);
    expect(resultado.isActive).toBe(false);

  });
});
