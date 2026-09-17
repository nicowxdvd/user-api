import { Role } from './role.entity';

describe('Role', () => {
  it('toggleStatus invierte isActive y conserva el resto de los datos', () => {
    const role = new Role('ADMIN', 'Administrador', true, 1, [{ id: 1, name: 'users:list' }]);

    const toggled = role.toggleStatus();

    expect(toggled.isActive).toBe(false);
    expect(toggled.name).toBe('ADMIN');
    expect(toggled.description).toBe('Administrador');
    expect(toggled.id).toBe(1);
    expect(toggled.permissions).toEqual([{ id: 1, name: 'users:list' }]);

  });
});
