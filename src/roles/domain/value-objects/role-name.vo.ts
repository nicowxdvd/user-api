import { ValidationError } from '../../../shared/domain/errors/domain.error';

export class RoleName {

  private constructor(private readonly value: string) {}


  static create(value: string): RoleName {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed)
      throw new ValidationError('El role es obligatorio');

    return new RoleName(trimmed);

  }


  toString(): string {
    return this.value;

  }
}
