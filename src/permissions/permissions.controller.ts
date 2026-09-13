import { Controller, Get, Post, Body, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors, Query, ParseBoolPipe, Patch, ParseIntPipe, UseFilters } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { QueryFailedFilter } from '../common/filters/query-failed.filter';

@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new QueryFailedFilter({ duplicado: 'Ya existe un permiso con ese nombre' }))
@Controller('permissions')
export class PermissionsController {

  constructor(private readonly permissionsService: PermissionsService) {}


  @UseGuards(PermissionsGuard)
  @RequirePermissions('permissions:manage')
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);

  }


  @Get()
  findAll(@Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean) {
    return this.permissionsService.findAll(isActive);

  }


  @UseGuards(PermissionsGuard)
  @RequirePermissions('permissions:manage')
  @Patch(':id/status')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.toggleStatus(id);

  }


  @UseGuards(PermissionsGuard)
  @RequirePermissions('permissions:manage')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.remove(id);

  }

}
