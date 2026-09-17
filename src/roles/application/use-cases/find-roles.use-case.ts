import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../../domain/entities/role.entity';
import type { FindRolesPort } from '../../domain/ports/in/find-roles.port';
import { ROLE_REPOSITORY_PORT } from '../../domain/ports/out/role-repository.port';
import type { RoleRepositoryPort } from '../../domain/ports/out/role-repository.port';

@Injectable()
export class FindRolesUseCase implements FindRolesPort {

  constructor(@Inject(ROLE_REPOSITORY_PORT) private readonly roleRepository: RoleRepositoryPort) {}


  execute(isActive?: boolean): Promise<Role[]> {
    return this.roleRepository.findAll(isActive);

  }
}
