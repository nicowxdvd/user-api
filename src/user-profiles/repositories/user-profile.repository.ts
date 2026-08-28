import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { IUserProfileRepository } from '../interfaces/user-profile-repository.interface';

@Injectable()
export class UserProfileRepository implements IUserProfileRepository {
  constructor(
    @InjectRepository(UserProfile)
    private readonly typeormRepo: Repository<UserProfile>,
  ) {}

  async save(userProfile: Partial<UserProfile>): Promise<UserProfile> {
    return await this.typeormRepo.save(userProfile);
  }

  async findAll(countryCode?: string): Promise<UserProfile[]> {
    const where = countryCode !== undefined ? { countryCode } : {};
    return await this.typeormRepo.find({ where });
  }

  async findById(id: number): Promise<UserProfile | null> {
    return await this.typeormRepo.findOneBy({ id });
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    return await this.typeormRepo.findOneBy({ userId });
  }

  async update(
    id: number,
    userProfile: Partial<UserProfile>,
  ): Promise<UserProfile | null> {
    await this.typeormRepo.update(id, userProfile);
    return await this.typeormRepo.findOneBy({ id });
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.typeormRepo.delete(id);
  }
}
