import { FindMeUseCase } from './find-me.use-case';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';
import { UsuarioDelTokenNoExisteError } from '../../domain/errors/user.errors';
import { User } from '../../domain/entities/user.entity';

describe('FindMeUseCase', () => {
  let useCase: FindMeUseCase;
  let repository: jest.Mocked<UserRepositoryPort>;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(), findById: jest.fn(), findByEmail: jest.fn(), save: jest.fn(), update: jest.fn(),
      updateStatus: jest.fn(), delete: jest.fn(),
    };

    useCase = new FindMeUseCase(repository);

  });

  it('lanza UsuarioDelTokenNoExisteError cuando el usuario del token ya no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('99')).rejects.toThrow(UsuarioDelTokenNoExisteError);

  });

  it('devuelve el usuario dueño del token', async () => {
    const usuario = new User('ana@test.com', 'hash', 'Ana', 'Gomez', 11, true, '1');
    repository.findById.mockResolvedValue(usuario);

    const resultado = await useCase.execute('1');

    expect(resultado).toBe(usuario);

  });
});
