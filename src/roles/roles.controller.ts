import { Controller, Get, Post, Body, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors, Query, ParseBoolPipe, Patch, ParseIntPipe, UseFilters } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { QueryFailedFilter } from '../common/filters/query-failed.filter';

@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new QueryFailedFilter({ duplicado: 'Ya existe un rol con ese nombre', referenciado: 'No se puede eliminar el rol porque tiene usuarios asignados' }))
@Controller('roles')
export class RolesController {

  constructor(private readonly rolesService: RolesService) {}


  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);

  }


  @Get()
  findAll(@Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean) {
    return this.rolesService.findAll(isActive);

  }


  @Patch(':id/status')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.toggleStatus(id);

  }


  @UseGuards(PermissionsGuard)
  @RequirePermissions('permissions:manage')
  @Patch(':id/permissions')
  updatePermissions(@Param('id', ParseIntPipe) id: number, @Body() updateRolePermissionsDto: UpdateRolePermissionsDto) {
    return this.rolesService.updatePermissions(id, updateRolePermissionsDto.permissionIds);

  }


  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.rolesService.remove(+id);

  }

}
