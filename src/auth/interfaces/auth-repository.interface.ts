import { UpdateResult } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export const AUTH_REPOSITORY_TOKEN = Symbol('AUTH_REPOSITORY_TOKEN');

export interface IAuthRepository {
  findByEmailWithPassword(email: string)                  : Promise<User | null>;
  updatePassword(userId: string, hashedPassword: string)  : Promise<UpdateResult>;

}