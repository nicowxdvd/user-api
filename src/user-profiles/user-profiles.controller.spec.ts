import { Test, TestingModule } from '@nestjs/testing';
import { UserProfilesController } from './user-profiles.controller';
import { UserProfilesService } from './user-profiles.service';
import { USER_PROFILE_REPOSITORY_TOKEN } from './interfaces/user-profile-repository.interface';
import { AuthGuard } from '../auth/auth.guard';

describe('UserProfilesController', () => {
  let controller: UserProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserProfilesController],
      providers: [
        UserProfilesService,
        {
          provide: USER_PROFILE_REPOSITORY_TOKEN,
          useValue: {
            save: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserProfilesController>(UserProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
