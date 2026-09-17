import { User } from './user.entity';

describe('User', () => {
  it('invierte isActive al alternar el estado', () => {
    const usuarioActivo = new User('ana@test.com', 'hash', 'Ana', 'Gomez', 1, true, '1');

    const usuarioInactivo = usuarioActivo.toggleStatus();

    expect(usuarioInactivo.isActive).toBe(false);
    expect(usuarioActivo.isActive).toBe(true);

  });

  it('conserva el resto de los datos al alternar el estado', () => {
    const usuario = new User('ana@test.com', 'hash', 'Ana', 'Gomez', 1, false, '1');

    const resultado = usuario.toggleStatus();

    expect(resultado.email).toBe('ana@test.com');
    expect(resultado.firstName).toBe('Ana');
    expect(resultado.lastName).toBe('Gomez');
    expect(resultado.roleId).toBe(1);
    expect(resultado.id).toBe('1');

  });
});
