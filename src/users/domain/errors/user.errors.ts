import { ConflictError, NotFoundError, ValidationError } from '../../../shared/domain/errors/domain.error';

export class EmailYaRegistradoError extends ConflictError {

  constructor() {
    super('El correo ya esta registrado.');

  }
}

export class UsuarioNoEncontradoError extends NotFoundError {

  constructor(id: string) {
    super(`El usuario con ID ${id} no existe`);

  }
}

export class UsuarioDelTokenNoExisteError extends NotFoundError {

  constructor() {
    super('El usuario del token ya no existe');

  }
}

export class LimiteDePaginaInvalidoError extends ValidationError {

  constructor(limiteMaximo: number) {
    super(`El límite debe ser un número entre 1 y ${limiteMaximo}`);

  }
}

export class CursorInvalidoError extends ValidationError {

  constructor() {
    super('El cursor de paginación no es válido');

  }
}

export class ActualizacionSinCambiosError extends ValidationError {

  constructor() {
    super('Debe enviar al menos un campo para actualizar');

  }
}
