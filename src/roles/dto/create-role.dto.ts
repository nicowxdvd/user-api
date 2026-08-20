import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: 'El role debe ser un texto' })
  @IsNotEmpty({ message: 'El role es obligatorio' })
  @MinLength(3, { message: 'El role debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El role no debe superar los 50 caracteres' })
  name: string = '';

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(255, {
    message: 'La descripción no debe superar los 255 caracteres',
  })
  description = '';
}
