import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, ParseIntPipe, UseGuards, UseInterceptors, ClassSerializerInterceptor, UseFilters } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserProfilesService } from './user-profiles.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AuthGuard } from '../auth/infrastructure/adapters/in/http/guards/auth.guard';
import { QueryFailedFilter } from '../shared/infrastructure/filters/query-failed.filter';

@ApiTags('user-profiles')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new QueryFailedFilter({ duplicado: 'El usuario ya tiene un perfil registrado', referenciado: 'No se puede eliminar el perfil porque tiene registros asociados' }))
@Controller('user-profiles')
export class UserProfilesController {

  constructor(private readonly userProfilesService: UserProfilesService) {}


  @Post()
  create(@Body() createUserProfileDto: CreateUserProfileDto) {
    return this.userProfilesService.create(createUserProfileDto);

  }


  @Get()
  findAll(@Query('countryCode') countryCode?: string) {
    return this.userProfilesService.findAll(countryCode);

  }


  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.userProfilesService.findByUserId(userId);

  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userProfilesService.findOne(id);

  }


  @Patch(':id')
  patch(@Param('id', ParseIntPipe) id: number, @Body() updateUserProfileDto: UpdateUserProfileDto) {
    return this.userProfilesService.update(id, updateUserProfileDto);

  }


  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserProfileDto: UpdateUserProfileDto) {
    return this.userProfilesService.update(id, updateUserProfileDto);

  }


  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userProfilesService.remove(id);

  }

}
