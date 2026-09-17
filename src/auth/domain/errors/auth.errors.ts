import { UnauthorizedError } from '../../../shared/domain/errors/domain.error';

export class CredencialesInvalidasError extends UnauthorizedError {

  constructor() {
    super('Credenciales inválidas');

  }
}

export class UsuarioInactivoError extends UnauthorizedError {

  constructor() {
    super('El usuario está inactivo');

  }
}
