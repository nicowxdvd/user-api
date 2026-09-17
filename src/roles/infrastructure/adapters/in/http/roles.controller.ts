import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, ParseBoolPipe, Patch, ParseIntPipe, UseFilters, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { RoleResponse } from './responses/role.response';
import { AuthGuard } from '../../../../../auth/infrastructure/adapters/in/http/guards/auth.guard';
import { PermissionsGuard } from '../../../../../auth/infrastructure/adapters/in/http/guards/permissions.guard';
import { RequirePermissions } from '../../../../../shared/infrastructure/decorators/require-permissions.decorator';
import { QueryFailedFilter } from '../../../../../shared/infrastructure/filters/query-failed.filter';
import { CREATE_ROLE_PORT } from '../../../../domain/ports/in/create-role.port';
import type { CreateRolePort } from '../../../../domain/ports/in/create-role.port';
import { FIND_ROLES_PORT } from '../../../../domain/ports/in/find-roles.port';
import type { FindRolesPort } from '../../../../domain/ports/in/find-roles.port';
import { TOGGLE_ROLE_STATUS_PORT } from '../../../../domain/ports/in/toggle-role-status.port';
import type { ToggleRoleStatusPort } from '../../../../domain/ports/in/toggle-role-status.port';
import { UPDATE_ROLE_PERMISSIONS_PORT } from '../../../../domain/ports/in/update-role-permissions.port';
import type { UpdateRolePermissionsPort } from '../../../../domain/ports/in/update-role-permissions.port';
import { DELETE_ROLE_PORT } from '../../../../domain/ports/in/delete-role.port';
import type { DeleteRolePort } from '../../../../domain/ports/in/delete-role.port';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@UseFilters(new QueryFailedFilter({ duplicado: 'Ya existe un rol con ese nombre', referenciado: 'No se puede eliminar el rol porque tiene usuarios asignados' }))
@Controller('roles')
export class RolesController {

  constructor(
    @Inject(CREATE_ROLE_PORT) private readonly createRoleUseCase: CreateRolePort,
    @Inject(FIND_ROLES_PORT) private readonly findRolesUseCase: FindRolesPort,
    @Inject(TOGGLE_ROLE_STATUS_PORT) private readonly toggleRoleStatusUseCase: ToggleRoleStatusPort,
    @Inject(UPDATE_ROLE_PERMISSIONS_PORT) private readonly updateRolePermissionsUseCase: UpdateRolePermissionsPort,
    @Inject(DELETE_ROLE_PORT) private readonly deleteRoleUseCase: DeleteRolePort,
  ) {}


  @UseGuards(PermissionsGuard)
  @RequirePermissions('roles:manage')
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.createRoleUseCase.execute(createRoleDto);
    return RoleResponse.fromDomain(role);

  }


  @Get()
  async findAll(@Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean) {
    const roles = await this.findRolesUseCase.execute(isActive);
    return roles.map((role) => RoleResponse.fromDomain(role));

  }


  @UseGuards(PermissionsGuard)
  @RequirePermissions('roles:manage')
  @Patch(':id/status')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.toggleRoleStatusUseCase.execute(id);

  }


  @UseGuards(PermissionsGuard)
  @RequirePermissions('permissions:manage')
  @Patch(':id/permissions')
  async updatePermissions(@Param('id', ParseIntPipe) id: number, @Body() updateRolePermissionsDto: UpdateRolePermissionsDto) {
    const role = await this.updateRolePermissionsUseCase.execute(id, updateRolePermissionsDto.permissionIds);
    return RoleResponse.fromDomain(role);

  }


  @UseGuards(PermissionsGuard)
  @RequirePermissions('roles:manage')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deleteRoleUseCase.execute(id);

  }

}
