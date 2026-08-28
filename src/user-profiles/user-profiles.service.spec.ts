// Los mocks de jest se pasan por referencia a expect(), lo que activa
// unbound-method sin que exista riesgo real de scoping de `this`.
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import {
  USER_PROFILE_REPOSITORY_TOKEN,
  type IUserProfileRepository,
} from './interfaces/user-profile-repository.interface';
import { UserProfile } from './entities/user-profile.entity';

describe('UserProfilesService', () => {
  let service: UserProfilesService;
  let repository: jest.Mocked<IUserProfileRepository>;

  beforeEach(async () => {
    repository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfilesService,
        { provide: USER_PROFILE_REPOSITORY_TOKEN, useValue: repository },
      ],
    }).compile();

    service = module.get<UserProfilesService>(UserProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('normaliza el código de país a mayúsculas al crear', async () => {
    repository.findByUserId.mockResolvedValue(null);
    repository.save.mockImplementation((profile) =>
      Promise.resolve(profile as UserProfile),
    );

    await service.create({
      userId: '11111111-1111-4111-8111-111111111111',
      countryCode: 'cl',
    });

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: 'CL' }),
    );
  });

  it('rechaza un segundo perfil para el mismo usuario', async () => {
    repository.findByUserId.mockResolvedValue({ id: 1 } as UserProfile);

    await expect(
      service.create({ userId: '11111111-1111-4111-8111-111111111111' }),
    ).rejects.toThrow(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('lanza NotFound cuando el perfil no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('lanza NotFound al eliminar un perfil inexistente', async () => {
    repository.delete.mockResolvedValue({ affected: 0, raw: [] });

    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });
});
