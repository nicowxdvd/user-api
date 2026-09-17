import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import type { FindUserByIdPort } from '../../domain/ports/in/find-user-by-id.port';
import { USER_REPOSITORY_PORT } from '../../domain/ports/out/user-repository.port';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';
import { UsuarioNoEncontradoError } from '../../domain/errors/user.errors';

@Injectable()
export class FindUserByIdUseCase implements FindUserByIdPort {

  constructor(@Inject(USER_REPOSITORY_PORT) private readonly userRepository: UserRepositoryPort) {}


  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user)
      throw new UsuarioNoEncontradoError(id);

    return user;

  }
}
