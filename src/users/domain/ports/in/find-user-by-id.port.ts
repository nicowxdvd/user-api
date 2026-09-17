import { User } from '../../entities/user.entity';

export const FIND_USER_BY_ID_PORT = Symbol('FIND_USER_BY_ID_PORT');

export interface FindUserByIdPort {
  execute(id: string): Promise<User>;
}
