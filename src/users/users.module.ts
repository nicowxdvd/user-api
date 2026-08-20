import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
})
export class UsersModule {}
