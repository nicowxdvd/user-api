import { IsString, IsNotEmpty, MinLength, MaxLength, Matches, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(30, { message: 'La contraseña no puede superar los 30 caracteres' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'La contraseña es muy débil (debe incluir mayúsculas, minúsculas y números)' })
  newPassword = '';

  @IsString({ message: 'El token debe ser un texto' })
  @IsNotEmpty({ message: 'El token es obligatorio' })
  @Length(64, 64, { message: 'El token no tiene un formato válido' })
  token = '';
}
