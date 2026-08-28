import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfilesService } from './user-profiles.service';
import { UserProfilesController } from './user-profiles.controller';
import { AuthModule } from '../auth/auth.module';
import { UserProfile } from './entities/user-profile.entity';
import { USER_PROFILE_REPOSITORY_TOKEN } from './interfaces/user-profile-repository.interface';
import { UserProfileRepository } from './repositories/user-profile.repository';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([UserProfile])],
  controllers: [UserProfilesController],
  providers: [
    UserProfilesService,
    {
      provide: USER_PROFILE_REPOSITORY_TOKEN,
      useClass: UserProfileRepository,
    },
  ],
})
export class UserProfilesModule {}
