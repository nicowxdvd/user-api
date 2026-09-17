import { ValidationError } from '../../../shared/domain/errors/domain.error';

export class PermissionName {

  private constructor(private readonly value: string) {}


  static create(value: string): PermissionName {
    const trimmed = value.trim();
    if (!trimmed)
      throw new ValidationError('El permiso es obligatorio');

    return new PermissionName(trimmed);

  }


  toString(): string {
    return this.value;

  }
}
