import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, ParseBoolPipe, Patch, ParseIntPipe, UseFilters, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionResponse } from './responses/permission.response';
import { AuthGuard } from '../../../../../auth/auth.guard';
import { PermissionsGuard } from '../../../../../auth/permissions.guard';
import { RequirePermissions } from '../../../../../shared/infrastructure/decorators/require-permissions.decorator';
import { QueryFailedFilter } from '../../../../../shared/infrastructure/filters/query-failed.filter';
import { CREATE_PERMISSION_PORT } from '../../../../domain/ports/in/create-permission.port';
import type { CreatePermissionPort } from '../../../../domain/ports/in/create-permission.port';
import { FIND_PERMISSIONS_PORT } from '../../../../domain/ports/in/find-permissions.port';
import type { FindPermissionsPort } from '../../../../domain/ports/in/find-permissions.port';
import { TOGGLE_PERMISSION_STATUS_PORT } from '../../../../domain/ports/in/toggle-permission-status.port';
import type { TogglePermissionStatusPort } from '../../../../domain/ports/in/toggle-permission-status.port';
import { DELETE_PERMISSION_PORT } from '../../../../domain/ports/in/delete-permission.port';
import type { DeletePermissionPort } from '../../../../domain/ports/in/delete-permission.port';

@ApiTags('permissions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@UseFilters(new QueryFailedFilter({ duplicado: 'Ya existe un permiso con ese nombre' }))
@Controller('permissions')
export class PermissionsController {

  constructor(
    @Inject(CREATE_PERMISSION_PORT) private readonly createPermissionUseCase: CreatePermissionPort,
    @Inject(FIND_PERMISSIONS_PORT) private readonly findPermissionsUseCase: FindPermissionsPort,
    @Inject(TOGGLE_PERMISSION_STATUS_PORT) private readonly togglePermissionStatusUseCase: TogglePermissionStatusPort,
    @Inject(DELETE_PERMISSION_PORT) private readonly deletePermissionUseCase: DeletePermissionPort,
  ) {}


  @UseGuards(PermissionsGuard)
  @RequirePermissions('permissions:manage')
  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const permission = await this.createPermissionUseCase.execute(createPermissionDto);
    return PermissionResponse.fromDomain(permission);

  }


  @Get()
  async findAll(@Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean) {
    const permissions = await this.findPermissionsUseCase.execute(isActive);
    return permissions.map((permission) => PermissionResponse.fromDomain(permission));

  }


  @UseGuards(PermissionsGuard)
  @RequirePermissions('permissions:manage')
  @Patch(':id/status')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.togglePermissionStatusUseCase.execute(id);

  }


  @UseGuards(PermissionsGuard)
  @RequirePermissions('permissions:manage')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deletePermissionUseCase.execute(id);

  }

}
