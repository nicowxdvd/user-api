import { Expose } from 'class-transformer';

/**
 * Contrato de salida de un usuario.
 *
 * Se construye con `plainToInstance(..., { excludeExtraneousValues: true })`,
 * así que solo sobreviven las propiedades marcadas con `@Expose()`: agregar una
 * columna a la entidad no la publica por accidente. La contraseña queda fuera
 * por omisión, sin depender del `@Exclude()` de la entidad.
 */
export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  isActive!: boolean;

  @Expose()
  roleId!: number;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
