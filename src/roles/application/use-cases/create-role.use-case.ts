import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../../domain/entities/role.entity';
import { RoleName } from '../../domain/value-objects/role-name.vo';
import type { CreateRoleCommand, CreateRolePort } from '../../domain/ports/in/create-role.port';
import { ROLE_REPOSITORY_PORT } from '../../domain/ports/out/role-repository.port';
import type { RoleRepositoryPort } from '../../domain/ports/out/role-repository.port';

@Injectable()
export class CreateRoleUseCase implements CreateRolePort {

  constructor(@Inject(ROLE_REPOSITORY_PORT) private readonly roleRepository: RoleRepositoryPort) {}


  async execute(command: CreateRoleCommand): Promise<Role> {
    const name = RoleName.create(command.name);
    const role = new Role(name.toString(), command.description);

    return this.roleRepository.save(role);

  }
}
