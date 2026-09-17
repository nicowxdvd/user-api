import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, BadRequestException, UseGuards, Put, ParseBoolPipe, ParseIntPipe, Query, Req, UseFilters, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponse } from './responses/user.response';
import { UserSummaryResponse } from './responses/user-summary.response';
import { AuthGuard } from '../../../../../auth/auth.guard';
import { PermissionsGuard } from '../../../../../auth/permissions.guard';
import { Public } from '../../../../../shared/infrastructure/decorators/public.decorator';
import { RequirePermissions } from '../../../../../shared/infrastructure/decorators/require-permissions.decorator';
import { JwtPayload } from '../../../../../auth/interfaces/jwt-payload.interface';
import { QueryFailedFilter } from '../../../../../shared/infrastructure/filters/query-failed.filter';
import { CREATE_USER_PORT } from '../../../../domain/ports/in/create-user.port';
import type { CreateUserPort } from '../../../../domain/ports/in/create-user.port';
import { FIND_USERS_PORT } from '../../../../domain/ports/in/find-users.port';
import type { FindUsersPort } from '../../../../domain/ports/in/find-users.port';
import { FIND_USER_BY_ID_PORT } from '../../../../domain/ports/in/find-user-by-id.port';
import type { FindUserByIdPort } from '../../../../domain/ports/in/find-user-by-id.port';
import { FIND_ME_PORT } from '../../../../domain/ports/in/find-me.port';
import type { FindMePort } from '../../../../domain/ports/in/find-me.port';
import { UPDATE_USER_PORT } from '../../../../domain/ports/in/update-user.port';
import type { UpdateUserPort } from '../../../../domain/ports/in/update-user.port';
import { TOGGLE_USER_STATUS_PORT } from '../../../../domain/ports/in/toggle-user-status.port';
import type { ToggleUserStatusPort } from '../../../../domain/ports/in/toggle-user-status.port';
import { DELETE_USER_PORT } from '../../../../domain/ports/in/delete-user.port';
import type { DeleteUserPort } from '../../../../domain/ports/in/delete-user.port';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@UseFilters(new QueryFailedFilter({ duplicado: 'El correo electrónico ya está registrado', referenciado: 'No se puede eliminar el usuario porque tiene registros asociados', referenciaInvalida: 'El rol indicado no existe' }))
@Controller('users')
export class UsersController {

  constructor(
    @Inject(CREATE_USER_PORT) private readonly createUserUseCase: CreateUserPort,
    @Inject(FIND_USERS_PORT) private readonly findUsersUseCase: FindUsersPort,
    @Inject(FIND_USER_BY_ID_PORT) private readonly findUserByIdUseCase: FindUserByIdPort,
    @Inject(FIND_ME_PORT) private readonly findMeUseCase: FindMePort,
    @Inject(UPDATE_USER_PORT) private readonly updateUserUseCase: UpdateUserPort,
    @Inject(TOGGLE_USER_STATUS_PORT) private readonly toggleUserStatusUseCase: ToggleUserStatusPort,
    @Inject(DELETE_USER_PORT) private readonly deleteUserUseCase: DeleteUserPort,
  ) {}


  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(createUserDto);
    return UserResponse.fromDomain(user);

  }


  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:list')
  @Get()
  async findAll(
    @Query('roleActive', new ParseBoolPipe({ optional: true })) roleActive?: boolean,
    @Query('cursor') cursor?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const page = await this.findUsersUseCase.execute({ roleActive, cursor, limit });
    return { data: page.data.map((user) => UserSummaryResponse.fromDomain(user)), nextCursor: page.nextCursor };

  }


  @Get('me')
  async findMe(@Req() request: Request) {
    const { sub } = request['user'] as JwtPayload;
    const user     = await this.findMeUseCase.execute(sub);

    return UserResponse.fromDomain(user);

  }


  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.findUserByIdUseCase.execute(id);
    return UserResponse.fromDomain(user);

  }


  @Patch(':id')
  async patch(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.updateUserUseCase.execute(id, updateUserDto);
    return UserResponse.fromDomain(user);

  }


  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.updateUserUseCase.execute(id, updateUserDto);
    return UserResponse.fromDomain(user);

  }


  @Patch(':id/status')
  toggleStatus(@Param('id') id: string) {
    return this.toggleUserStatusUseCase.execute(id);

  }


  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ exceptionFactory: () => new BadRequestException('El id del usuario debe ser un UUID válido') })) id: string) {
    return this.deleteUserUseCase.execute(id);

  }

}
