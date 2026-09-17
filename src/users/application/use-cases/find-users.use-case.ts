import { Inject, Injectable } from '@nestjs/common';
import type { FindUsersPort, FindUsersQuery } from '../../domain/ports/in/find-users.port';
import { USER_REPOSITORY_PORT } from '../../domain/ports/out/user-repository.port';
import type { UserRepositoryPort, UsersCursor, UsersPage } from '../../domain/ports/out/user-repository.port';
import { CursorInvalidoError, LimiteDePaginaInvalidoError } from '../../domain/errors/user.errors';

const LIMITE_POR_DEFECTO = 20;
const LIMITE_MAXIMO      = 100;

@Injectable()
export class FindUsersUseCase implements FindUsersPort {

  constructor(@Inject(USER_REPOSITORY_PORT) private readonly userRepository: UserRepositoryPort) {}


  async execute(query: FindUsersQuery): Promise<UsersPage> {
    const take = query.limit ?? LIMITE_POR_DEFECTO;
    if (take < 1 || take > LIMITE_MAXIMO)
      throw new LimiteDePaginaInvalidoError(LIMITE_MAXIMO);

    return this.userRepository.findAll(query.roleActive, this.decodeCursor(query.cursor), take);

  }


  private decodeCursor(cursorToken?: string): UsersCursor | undefined {
    if (!cursorToken) return undefined;

    const [createdAt, id] = Buffer.from(cursorToken, 'base64').toString('utf8').split('|');
    if (!createdAt || !id || Number.isNaN(Date.parse(createdAt)))
      throw new CursorInvalidoError();

    return { createdAt: new Date(createdAt), id };

  }
}
