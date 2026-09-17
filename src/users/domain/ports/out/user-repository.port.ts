import { User } from '../../entities/user.entity';
import { UserSummary } from '../../entities/user-summary.entity';

export const USER_REPOSITORY_PORT = Symbol('USER_REPOSITORY_PORT');

export interface UsersCursor {
  createdAt: Date;
  id: string;
}

export interface UsersPage {
  data: UserSummary[];
  nextCursor: string | null;
}

export interface DeleteOutcome {
  affected?: number | null;
}

export interface UserRepositoryPort {
  findAll(roleActive?: boolean, cursor?: UsersCursor, limit?: number): Promise<UsersPage>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(id: string, changes: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>): Promise<User | null>;
  updateStatus(id: string, isActive: boolean): Promise<DeleteOutcome>;
  delete(id: string): Promise<DeleteOutcome>;
}
