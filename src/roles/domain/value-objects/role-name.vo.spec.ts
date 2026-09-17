import { RoleName } from './role-name.vo';
import { ValidationError } from '../../../shared/domain/errors/domain.error';

describe('RoleName', () => {
  it('recorta espacios y pasa a mayúsculas', () => {
    const name = RoleName.create('  admin  ');

    expect(name.toString()).toBe('ADMIN');

  });

  it('rechaza un nombre vacío tras recortar espacios', () => {
    expect(() => RoleName.create('   ')).toThrow(ValidationError);

  });
});
