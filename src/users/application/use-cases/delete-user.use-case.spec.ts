import { DeleteUserUseCase } from './delete-user.use-case';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';
import { UsuarioNoEncontradoError } from '../../domain/errors/user.errors';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let repository: jest.Mocked<UserRepositoryPort>;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(), findById: jest.fn(), findByEmail: jest.fn(), save: jest.fn(), update: jest.fn(),
      updateStatus: jest.fn(), delete: jest.fn(),
    };

    useCase = new DeleteUserUseCase(repository);

  });

  it('lanza UsuarioNoEncontradoError cuando no elimina ninguna fila', async () => {
    repository.delete.mockResolvedValue({ affected: 0 });

    await expect(useCase.execute('99')).rejects.toThrow(UsuarioNoEncontradoError);

  });

  it('elimina el usuario y devuelve el mensaje', async () => {
    repository.delete.mockResolvedValue({ affected: 1 });

    const resultado = await useCase.execute('1');

    expect(resultado).toEqual({ message: 'Usuario con ID 1 eliminado exitosamente' });

  });
});
