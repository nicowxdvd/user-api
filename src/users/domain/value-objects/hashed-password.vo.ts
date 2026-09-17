import { ValidationError } from '../../../shared/domain/errors/domain.error';

export class HashedPassword {

  private constructor(private readonly value: string) {}


  static fromHash(hash: string): HashedPassword {
    if (!hash)
      throw new ValidationError('El hash de la contraseña no puede estar vacío');

    return new HashedPassword(hash);

  }


  toString(): string {
    return this.value;

  }
}
