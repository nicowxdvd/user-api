/* eslint-disable @typescript-eslint/unbound-method */
import { UpdateUserUseCase } from './update-user.use-case';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';
import { ActualizacionSinCambiosError, UsuarioNoEncontradoError } from '../../domain/errors/user.errors';
import { User } from '../../domain/entities/user.entity';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let repository: jest.Mocked<UserRepositoryPort>;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(), findById: jest.fn(), findByEmail: jest.fn(), save: jest.fn(), update: jest.fn(),
      updateStatus: jest.fn(), delete: jest.fn(),
    };

    useCase = new UpdateUserUseCase(repository);

  });

  it('rechaza una actualización sin campos', async () => {
    await expect(useCase.execute('1', {})).rejects.toThrow(ActualizacionSinCambiosError);
    expect(repository.update).not.toHaveBeenCalled();

  });

  it('lanza UsuarioNoEncontradoError cuando el usuario no existe', async () => {
    repository.update.mockResolvedValue(null);

    await expect(useCase.execute('99', { firstName: 'Ana' })).rejects.toThrow(UsuarioNoEncontradoError);

  });

  it('actualiza y devuelve el usuario', async () => {
    const usuario = new User('ana@test.com', 'hash', 'Ana', 'Gomez', 11, true, '1');
    repository.update.mockResolvedValue(usuario);

    const resultado = await useCase.execute('1', { firstName: 'Ana' });

    expect(repository.update).toHaveBeenCalledWith('1', { firstName: 'Ana' });
    expect(resultado).toBe(usuario);

  });
});
