import { HashedPassword } from './hashed-password.vo';
import { ValidationError } from '../../../shared/domain/errors/domain.error';

describe('HashedPassword', () => {
  it('envuelve un hash no vacío', () => {
    const hashedPassword = HashedPassword.fromHash('$2b$10$hash-simulado');

    expect(hashedPassword.toString()).toBe('$2b$10$hash-simulado');

  });

  it('rechaza un hash vacío', () => {
    expect(() => HashedPassword.fromHash('')).toThrow(ValidationError);

  });
});
