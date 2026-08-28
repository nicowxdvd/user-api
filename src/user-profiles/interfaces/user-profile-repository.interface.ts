import { DeleteResult } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';

export const USER_PROFILE_REPOSITORY_TOKEN = Symbol(
  'USER_PROFILE_REPOSITORY_TOKEN',
);

export interface IUserProfileRepository {
  save(userProfile: Partial<UserProfile>): Promise<UserProfile>;
  findAll(countryCode?: string): Promise<UserProfile[]>;
  findById(id: number): Promise<UserProfile | null>;
  findByUserId(userId: string): Promise<UserProfile | null>;
  update(
    id: number,
    userProfile: Partial<UserProfile>,
  ): Promise<UserProfile | null>;
  delete(id: number): Promise<DeleteResult>;
}
