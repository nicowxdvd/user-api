import { PermissionName } from './permission-name.vo';
import { ValidationError } from '../../../shared/domain/errors/domain.error';

describe('PermissionName', () => {
  it('recorta los espacios sin cambiar mayúsculas/minúsculas', () => {
    const name = PermissionName.create('  users:list  ');

    expect(name.toString()).toBe('users:list');

  });

  it('rechaza un nombre vacío tras recortar espacios', () => {
    expect(() => PermissionName.create('   ')).toThrow(ValidationError);

  });
});
