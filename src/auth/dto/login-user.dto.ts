import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email = '';

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password = '';
}
