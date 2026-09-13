import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, BadRequestException, UseGuards, ClassSerializerInterceptor, UseInterceptors, Put, ParseBoolPipe, Query, Req, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../common/decorators/public.decorator';
import type { Request } from 'express';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { QueryFailedFilter } from '../common/filters/query-failed.filter';

@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new QueryFailedFilter({ duplicado: 'El correo electrónico ya está registrado', referenciado: 'No se puede eliminar el usuario porque tiene registros asociados', referenciaInvalida: 'El rol indicado no existe' }))
@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}


  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);

  }


  @Get()
  findAll(@Query('roleActive', new ParseBoolPipe({ optional: true })) roleActive?: boolean) {
    return this.usersService.findAll(roleActive);

  }


  // 'me' se declara antes de ':id' a propósito: Nest resuelve las rutas por
  // orden de declaración, y si ':id' fuera primero capturaría la palabra 'me'
  // como si fuese un identificador.
  @Get('me')
  findMe(@Req() request: Request) {
    const { sub } = request['user'] as JwtPayload;
    return this.usersService.findMe(sub);

  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);

  }


  @Patch(':id')
  patch(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);

  }


  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);

  }


  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ exceptionFactory: () => new BadRequestException('El id del usuario debe ser un UUID válido') })) id: string) {
    return this.usersService.remove(id);

  }

}
