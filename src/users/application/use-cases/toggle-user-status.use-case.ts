import { Inject, Injectable } from '@nestjs/common';
import type { ToggleUserStatusPort, ToggleUserStatusResult } from '../../domain/ports/in/toggle-user-status.port';
import { USER_REPOSITORY_PORT } from '../../domain/ports/out/user-repository.port';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';
import { UsuarioNoEncontradoError } from '../../domain/errors/user.errors';

@Injectable()
export class ToggleUserStatusUseCase implements ToggleUserStatusPort {

  constructor(@Inject(USER_REPOSITORY_PORT) private readonly userRepository: UserRepositoryPort) {}


  async execute(id: string): Promise<ToggleUserStatusResult> {
    const user = await this.userRepository.findById(id);
    if (!user)
      throw new UsuarioNoEncontradoError(id);

    const newStatus = !user.isActive;
    await this.userRepository.updateStatus(id, newStatus);

    return { message: `El usuario ahora está ${newStatus ? 'activo' : 'inactivo'}`, isActive: newStatus };

  }
}
