import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleRepository } from './repositories/role.repository';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [RolesService, RoleRepository],
})
export class RolesModule {}
