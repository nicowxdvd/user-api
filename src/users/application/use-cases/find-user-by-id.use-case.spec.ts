import { FindUserByIdUseCase } from './find-user-by-id.use-case';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';
import { UsuarioNoEncontradoError } from '../../domain/errors/user.errors';
import { User } from '../../domain/entities/user.entity';

describe('FindUserByIdUseCase', () => {
  let useCase: FindUserByIdUseCase;
  let repository: jest.Mocked<UserRepositoryPort>;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(), findById: jest.fn(), findByEmail: jest.fn(), save: jest.fn(), update: jest.fn(),
      updateStatus: jest.fn(), delete: jest.fn(),
    };

    useCase = new FindUserByIdUseCase(repository);

  });

  it('lanza UsuarioNoEncontradoError cuando no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('99')).rejects.toThrow(UsuarioNoEncontradoError);

  });

  it('devuelve el usuario cuando existe', async () => {
    const usuario = new User('ana@test.com', 'hash', 'Ana', 'Gomez', 11, true, '1');
    repository.findById.mockResolvedValue(usuario);

    const resultado = await useCase.execute('1');

    expect(resultado).toBe(usuario);

  });
});
