import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString({ message: 'El permiso debe ser un texto' })
  @IsNotEmpty({ message: 'El permiso es obligatorio' })
  @MinLength(3, { message: 'El permiso debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El permiso no debe superar los 100 caracteres' })
  name: string = '';

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(255, { message: 'La descripción no debe superar los 255 caracteres' })
  description = '';
}
