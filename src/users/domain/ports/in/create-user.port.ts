import { User } from '../../entities/user.entity';

export const CREATE_USER_PORT = Symbol('CREATE_USER_PORT');

export interface CreateUserCommand {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface CreateUserPort {
  execute(command: CreateUserCommand): Promise<User>;
}
