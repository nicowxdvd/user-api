import { ValidationError } from '../../../shared/domain/errors/domain.error';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {

  private constructor(private readonly value: string) {}


  static create(value: string): Email {
    if (!EMAIL_REGEX.test(value))
      throw new ValidationError('El e-mail debe tener un formato válido');

    return new Email(value);

  }


  toString(): string {
    return this.value;

  }
}
