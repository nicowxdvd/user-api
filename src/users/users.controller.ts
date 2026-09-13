import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  Put,
  ParseBoolPipe,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../common/decorators/public.decorator';
import type { Request } from 'express';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(
    @Query('roleActive', new ParseBoolPipe({ optional: true }))
    roleActive?: boolean,
  ) {
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
