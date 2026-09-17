import { User } from '../../entities/user.entity';

export const FIND_ME_PORT = Symbol('FIND_ME_PORT');

export interface FindMePort {
  execute(id: string): Promise<User>;
}
