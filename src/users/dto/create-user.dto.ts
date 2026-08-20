import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  IsEmail,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El nombre no debe superar los 50 caracteres' })
  firstName: string = '';

  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MinLength(3, { message: 'El apeliido debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El apeliido no debe superar los 50 caracteres' })
  lastName: string = '';

  @IsEmail()
  @IsNotEmpty({ message: 'El e-mail es obligatorio' })
  email: string = '';

  @IsInt()
  @Min(0)
  roleId: number = 0;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(30, {
    message: 'La contraseña no puede superar los 30 caracteres',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña es muy débil (debe incluir mayúsculas, minúsculas y números)',
  })
  password: string = '';
}
