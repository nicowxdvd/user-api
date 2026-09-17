/* eslint-disable @typescript-eslint/unbound-method */
import { FindUsersUseCase } from './find-users.use-case';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';
import { CursorInvalidoError, LimiteDePaginaInvalidoError } from '../../domain/errors/user.errors';

describe('FindUsersUseCase', () => {
  let useCase: FindUsersUseCase;
  let repository: jest.Mocked<UserRepositoryPort>;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(), findById: jest.fn(), findByEmail: jest.fn(), save: jest.fn(), update: jest.fn(),
      updateStatus: jest.fn(), delete: jest.fn(),
    };

    useCase = new FindUsersUseCase(repository);

  });

  it('rechaza un límite fuera de rango', async () => {
    await expect(useCase.execute({ limit: 0 })).rejects.toThrow(LimiteDePaginaInvalidoError);
    await expect(useCase.execute({ limit: 101 })).rejects.toThrow(LimiteDePaginaInvalidoError);

  });

  it('rechaza un cursor mal formado', async () => {
    await expect(useCase.execute({ cursor: 'no-es-base64-valido' })).rejects.toThrow(CursorInvalidoError);

  });

  it('decodifica el cursor y lo delega al repositorio', async () => {
    repository.findAll.mockResolvedValue({ data: [], nextCursor: null });
    const cursorToken = Buffer.from('2024-01-01T00:00:00.000Z|1').toString('base64');

    await useCase.execute({ cursor: cursorToken, limit: 10 });

    expect(repository.findAll).toHaveBeenCalledWith(undefined, { createdAt: new Date('2024-01-01T00:00:00.000Z'), id: '1' }, 10);

  });

  it('usa el límite por defecto cuando no se especifica', async () => {
    repository.findAll.mockResolvedValue({ data: [], nextCursor: null });

    await useCase.execute({});

    expect(repository.findAll).toHaveBeenCalledWith(undefined, undefined, 20);

  });
});
