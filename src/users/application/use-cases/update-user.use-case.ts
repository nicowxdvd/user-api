import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import type { UpdateUserCommand, UpdateUserPort } from '../../domain/ports/in/update-user.port';
import { USER_REPOSITORY_PORT } from '../../domain/ports/out/user-repository.port';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';
import { ActualizacionSinCambiosError, UsuarioNoEncontradoError } from '../../domain/errors/user.errors';

@Injectable()
export class UpdateUserUseCase implements UpdateUserPort {

  constructor(@Inject(USER_REPOSITORY_PORT) private readonly userRepository: UserRepositoryPort) {}


  async execute(id: string, changes: UpdateUserCommand): Promise<User> {
    if (Object.keys(changes).length === 0)
      throw new ActualizacionSinCambiosError();

    const user = await this.userRepository.update(id, changes);
    if (!user)
      throw new UsuarioNoEncontradoError(id);

    return user;

  }
}
