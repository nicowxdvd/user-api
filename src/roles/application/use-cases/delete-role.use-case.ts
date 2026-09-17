import { Inject, Injectable } from '@nestjs/common';
import type { DeleteRolePort, DeleteRoleResult } from '../../domain/ports/in/delete-role.port';
import { ROLE_REPOSITORY_PORT } from '../../domain/ports/out/role-repository.port';
import type { RoleRepositoryPort } from '../../domain/ports/out/role-repository.port';
import { RolNoEncontradoError } from '../../domain/errors/role.errors';

@Injectable()
export class DeleteRoleUseCase implements DeleteRolePort {

  constructor(@Inject(ROLE_REPOSITORY_PORT) private readonly roleRepository: RoleRepositoryPort) {}


  async execute(id: number): Promise<DeleteRoleResult> {
    const result = await this.roleRepository.delete(id);
    if (!result.affected)
      throw new RolNoEncontradoError(id);

    return { message: `Rol con ID ${id} eliminado exitosamente` };

  }
}
