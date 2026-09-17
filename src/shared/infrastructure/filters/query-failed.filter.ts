import { ArgumentsHost, Catch, ConflictException, ExceptionFilter, HttpException, InternalServerErrorException, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { Response } from 'express';


export interface MensajesDeBaseDeDatos {
  duplicado?: string;
  referenciado?: string;
  referenciaInvalida?: string;
}

type ErrorDeMysql = QueryFailedError & { errno?: number };
@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {

  private readonly logger = new Logger(QueryFailedFilter.name);

  constructor(
    private readonly mensajes: MensajesDeBaseDeDatos = {}) 
  {}


  catch(exception: ErrorDeMysql, host: ArgumentsHost): void {
    const respuesta = host.switchToHttp().getResponse<Response>();
    const error     = this.traducir(exception);
    respuesta.status(error.getStatus()).json(error.getResponse());

  }


  private traducir(exception: ErrorDeMysql): HttpException {
    switch (exception.errno) {
      case 1062:
        return new ConflictException(this.mensajes.duplicado ?? 'Ya existe un registro con esos datos');
      case 1451:
        return new ConflictException(this.mensajes.referenciado ?? 'No se puede eliminar porque tiene registros asociados');
      case 1452:
        return new ConflictException(this.mensajes.referenciaInvalida ?? 'El registro referenciado no existe');
      default:
        this.logger.error(`Error de base de datos sin traducir (errno ${exception.errno}): ${exception.message}`);
        return new InternalServerErrorException('Error al acceder a los datos');
    }

  }

}
