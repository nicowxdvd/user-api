import { NotFoundError } from '../../../shared/domain/errors/domain.error';

export class PermisoNoEncontradoError extends NotFoundError {

  constructor(id: number) {
    super(`El permiso con ID ${id} no existe`);

  }
}
