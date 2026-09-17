import { User } from '../../entities/user.entity';

export const UPDATE_USER_PORT = Symbol('UPDATE_USER_PORT');

export interface UpdateUserCommand {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UpdateUserPort {
  execute(id: string, changes: UpdateUserCommand): Promise<User>;
}
