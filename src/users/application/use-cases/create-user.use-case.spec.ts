/* eslint-disable @typescript-eslint/unbound-method */
import { CreateUserUseCase } from './create-user.use-case';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';
import type { PasswordHasherPort } from '../../../shared/domain/ports/password-hasher.port';
import { EmailYaRegistradoError } from '../../domain/errors/user.errors';
import { User } from '../../domain/entities/user.entity';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let repository: jest.Mocked<UserRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(), findById: jest.fn(), findByEmail: jest.fn(), save: jest.fn(), update: jest.fn(),
      updateStatus: jest.fn(), delete: jest.fn(),
    };
    passwordHasher = { hash: jest.fn(), compare: jest.fn() };

    useCase = new CreateUserUseCase(repository, passwordHasher);

  });

  it('rechaza un correo ya registrado', async () => {
    repository.findByEmail.mockResolvedValue(new User('ana@test.com', 'hash', 'Ana', 'Gomez', 11, true, '1'));

    await expect(useCase.execute({ firstName: 'Ana', lastName: 'Gomez', email: 'ana@test.com', password: 'Abcdefg1' })).rejects.toThrow(EmailYaRegistradoError);

    expect(repository.save).not.toHaveBeenCalled();

  });

  it('crea el usuario con la contraseña hasheada', async () => {
    repository.findByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hash-simulado');
    repository.save.mockImplementation((user) => Promise.resolve(user));

    const resultado = await useCase.execute({ firstName: 'Ana', lastName: 'Gomez', email: 'ana@test.com', password: 'Abcdefg1' });

    expect(passwordHasher.hash).toHaveBeenCalledWith('Abcdefg1');
    expect(resultado.password).toBe('hash-simulado');
    expect(resultado.roleId).toBeUndefined();

  });
});
