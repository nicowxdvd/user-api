import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsString({ message: 'El correo debe ser un texto' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  @MinLength(2, { message: 'El correo debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El correo no debe superar los 50 caracteres' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email = '';
}
