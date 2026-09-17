import { Email } from './email.vo';
import { ValidationError } from '../../../shared/domain/errors/domain.error';

describe('Email', () => {
  it('acepta un formato válido', () => {
    const email = Email.create('nico@test.com');

    expect(email.toString()).toBe('nico@test.com');

  });

  it('rechaza un formato inválido', () => {
    expect(() => Email.create('no-es-un-email')).toThrow(ValidationError);

  });

  it('rechaza un valor vacío', () => {
    expect(() => Email.create('')).toThrow(ValidationError);

  });
});
