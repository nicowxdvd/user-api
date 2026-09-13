import { DeleteResult } from 'typeorm';
import { User } from '../entities/user.entity';
export const USER_REPOSITORY_TOKEN = Symbol('USER_REPOSITORY_TOKEN');

export interface UsersCursor {
  createdAt : Date;
  id        : string;
}

export interface UsersPage {
  data        : User[];
  nextCursor  : string | null;
}

export interface IUserRepository {
  findAll(roleActive?: boolean, cursor?: UsersCursor, limit?: number) : Promise<UsersPage>;
  findById(id: string)                        : Promise<User | null>;
  findByEmail(email: string)                  : Promise<User | null>;
  save(user: Partial<User>)                   : Promise<User>;
  update(id: string, user: Partial<User>)     : Promise<User | null>;
  updateStatus(id: string, isActive: boolean) : Promise<{ affected?: number | null }>;
  delete(id: string)                          : Promise<DeleteResult>;

}
