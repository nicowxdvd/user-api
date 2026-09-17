import { NotFoundError } from '../../../shared/domain/errors/domain.error';

export class RolNoEncontradoError extends NotFoundError {

  constructor(id: number) {
    super(`El rol con ID ${id} no existe`);

  }
}

export class PermisosNoEncontradosError extends NotFoundError {

  constructor() {
    super('Uno o más permisos indicados no existen');

  }
}
