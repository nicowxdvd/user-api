import { IsArray, ArrayUnique, IsInt } from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsArray({ message: 'Los permisos deben ser una lista' })
  @ArrayUnique({ message: 'No se puede repetir un permiso' })
  @IsInt({ each: true, message: 'Cada permiso debe ser un id numérico' })
  permissionIds: number[] = [];
}
