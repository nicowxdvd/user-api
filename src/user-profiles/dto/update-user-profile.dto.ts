import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserProfileDto } from './create-user-profile.dto';

// Se omite userId: el dueño del perfil no se reasigna vía PATCH/PUT. Con
// forbidNonWhitelisted activo, enviarlo en el body devuelve 400.
export class UpdateUserProfileDto extends PartialType(
  OmitType(CreateUserProfileDto, ['userId'] as const),
) {}
