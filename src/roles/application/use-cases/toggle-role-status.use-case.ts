import { Inject, Injectable } from '@nestjs/common';
import type { ToggleRoleStatusPort, ToggleRoleStatusResult } from '../../domain/ports/in/toggle-role-status.port';
import { ROLE_REPOSITORY_PORT } from '../../domain/ports/out/role-repository.port';
import type { RoleRepositoryPort } from '../../domain/ports/out/role-repository.port';
import { RolNoEncontradoError } from '../../domain/errors/role.errors';

@Injectable()
export class ToggleRoleStatusUseCase implements ToggleRoleStatusPort {

  constructor(@Inject(ROLE_REPOSITORY_PORT) private readonly roleRepository: RoleRepositoryPort) {}


  async execute(id: number): Promise<ToggleRoleStatusResult> {
    const role = await this.roleRepository.findById(id);
    if (!role)
      throw new RolNoEncontradoError(id);

    const newStatus = !role.isActive;
    await this.roleRepository.updateStatus(id, newStatus);

    return { message: `El rol ahora está ${newStatus ? 'activo' : 'inactivo'}`, isActive: newStatus };

  }
}
