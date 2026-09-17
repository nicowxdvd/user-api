import { Permission } from './permission.entity';

describe('Permission', () => {
  it('toggleStatus invierte isActive y conserva el resto de los datos', () => {
    const permission = new Permission('users:list', 'Listar usuarios', true, 1);

    const toggled = permission.toggleStatus();

    expect(toggled.isActive).toBe(false);
    expect(toggled.name).toBe('users:list');
    expect(toggled.description).toBe('Listar usuarios');
    expect(toggled.id).toBe(1);

  });
});
