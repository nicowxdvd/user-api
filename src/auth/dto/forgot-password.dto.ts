import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email = '';
}
