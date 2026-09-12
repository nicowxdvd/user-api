import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../common/decorators/public.decorator';

@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.rolesService.findAll(true);
  }

  @Patch(':id/status')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.rolesService.remove(+id);
  }
}
