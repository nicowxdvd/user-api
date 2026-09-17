import { ArgumentsHost, BadRequestException, Catch, ConflictException, ExceptionFilter, HttpException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { ConflictError, DomainError, NotFoundError, UnauthorizedError, ValidationError } from '../../domain/errors/domain.error';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {

  catch(exception: DomainError, host: ArgumentsHost): void {
    const respuesta = host.switchToHttp().getResponse<Response>();
    const error     = this.traducir(exception);
    respuesta.status(error.getStatus()).json(error.getResponse());

  }


  private traducir(exception: DomainError): HttpException {
    if (exception instanceof NotFoundError) return new NotFoundException(exception.message);
    if (exception instanceof ConflictError) return new ConflictException(exception.message);
    if (exception instanceof ValidationError) return new BadRequestException(exception.message);
    if (exception instanceof UnauthorizedError) return new UnauthorizedException(exception.message);

    return new InternalServerErrorException('Error interno');

  }
}
