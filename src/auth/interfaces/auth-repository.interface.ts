import { UpdateResult } from 'typeorm';
import { UserOrmEntity } from '../../users/infrastructure/adapters/out/persistence/user.orm-entity';

export const AUTH_REPOSITORY_TOKEN = Symbol('AUTH_REPOSITORY_TOKEN');

export interface IAuthRepository {
  findByEmailWithPassword(email: string)                  : Promise<UserOrmEntity | null>;
  updatePassword(userId: string, hashedPassword: string)  : Promise<UpdateResult>;
  findByEmail(email:string)                               : Promise<Pick<UserOrmEntity, 'id' | 'isActive'> | null>;

}