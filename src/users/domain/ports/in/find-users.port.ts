import { UsersPage } from '../out/user-repository.port';

export const FIND_USERS_PORT = Symbol('FIND_USERS_PORT');

export interface FindUsersQuery {
  roleActive?: boolean;
  cursor?: string;
  limit?: number;
}

export interface FindUsersPort {
  execute(query: FindUsersQuery): Promise<UsersPage>;
}
