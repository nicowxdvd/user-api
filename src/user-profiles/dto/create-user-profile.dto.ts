import {IsDateString,IsISO31661Alpha2,IsNotEmpty,IsObject,IsOptional,IsString,IsUUID,IsUrl,Matches, MaxLength, } from 'class-validator';

export class CreateUserProfileDto {
  @IsUUID(undefined, {message: 'El identificador del usuario debe ser un UUID válido',})
  @IsNotEmpty({ message: 'El identificador del usuario es obligatorio' })
  userId: string = '';

  @IsOptional()
  @IsUrl({}, { message: 'La URL del avatar no es válida' })
  @MaxLength(255, {message: 'La URL del avatar no debe superar los 255 caracteres',})
  avatarUrl?: string;

  @IsOptional()
  @IsString({ message: 'La biografía debe ser un texto' })
  @MaxLength(65535, {message: 'La biografía no debe superar los 65535 caracteres',})
  bio?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  @MaxLength(20, { message: 'El teléfono no debe superar los 20 caracteres' })
  @Matches(/^\+?[\d\s()-]{7,20}$/, {message: 'El formato del teléfono no es válido',})
  phone?: string;

  @IsOptional()
  @IsISO31661Alpha2({message: 'El código de país debe ser un código ISO 3166-1 alfa-2 (ej: CL)',})
  countryCode?: string;

  @IsOptional()
  @IsDateString( { strict: true },{message: 'La fecha de nacimiento debe tener el formato AAAA-MM-DD',},)
  birthDate?: string;

  @IsOptional()
  @IsObject({ message: 'Las preferencias deben ser un objeto JSON' })
  preferences?: Record<string, unknown>;
}
