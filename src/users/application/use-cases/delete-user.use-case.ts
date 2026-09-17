import { Inject, Injectable } from '@nestjs/common';
import type { DeleteUserPort, DeleteUserResult } from '../../domain/ports/in/delete-user.port';
import { USER_REPOSITORY_PORT } from '../../domain/ports/out/user-repository.port';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';
import { UsuarioNoEncontradoError } from '../../domain/errors/user.errors';

@Injectable()
export class DeleteUserUseCase implements DeleteUserPort {

  constructor(@Inject(USER_REPOSITORY_PORT) private readonly userRepository: UserRepositoryPort) {}


  async execute(id: string): Promise<DeleteUserResult> {
    const result = await this.userRepository.delete(id);
    if (!result.affected)
      throw new UsuarioNoEncontradoError(id);

    return { message: `Usuario con ID ${id} eliminado exitosamente` };

  }
}
