import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { Response } from 'express';

/**
 * Mensajes que cada controlador puede personalizar. Las claves describen la
 * situación de negocio, no el código de MySQL: quien usa el filtro no necesita
 * saber que 1062 significa clave duplicada.
 */
export interface MensajesDeBaseDeDatos {
  duplicado?: string;
  referenciado?: string;
  referenciaInvalida?: string;
}

/**
 * TypeORM copia sobre la excepción las propiedades del error del driver
 * (`ObjectUtils.assign(this, {...driverError})`), así que `errno` se lee
 * directamente y no hace falta entrar a `driverError`.
 */
type ErrorDeMysql = QueryFailedError & { errno?: number };

/**
 * Traduce los errores del driver de MySQL a excepciones HTTP en un solo lugar,
 * para que los servicios no repitan el mismo `try/catch` en cada método.
 *
 * Se registra global en `AppModule` con mensajes genéricos, y cada controlador
 * lo vuelve a declarar con `@UseFilters(new QueryFailedFilter({ ... }))` para
 * afinar el texto: Nest resuelve primero el filtro de método, después el de
 * controlador y por último el global, así que el más específico gana.
 */
@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
  private readonly logger = new Logger(QueryFailedFilter.name);

  constructor(private readonly mensajes: MensajesDeBaseDeDatos = {}) {}

  catch(exception: ErrorDeMysql, host: ArgumentsHost): void {
    const respuesta = host.switchToHttp().getResponse<Response>();
    const error = this.traducir(exception);

    respuesta.status(error.getStatus()).json(error.getResponse());
  }

  private traducir(exception: ErrorDeMysql): HttpException {
    switch (exception.errno) {
      case 1062:
        return new ConflictException(
          this.mensajes.duplicado ?? 'Ya existe un registro con esos datos',
        );
      case 1451:
        return new ConflictException(
          this.mensajes.referenciado ??
            'No se puede eliminar porque tiene registros asociados',
        );
      case 1452:
        return new ConflictException(
          this.mensajes.referenciaInvalida ??
            'El registro referenciado no existe',
        );
      default:
        // Un errno que no está mapeado es un fallo real, no una regla de
        // negocio: se registra para poder diagnosticarlo en vez de perderlo.
        this.logger.error(
          `Error de base de datos sin traducir (errno ${exception.errno}): ${exception.message}`,
        );
        return new InternalServerErrorException('Error al acceder a los datos');
    }
  }
}
