import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';
import { ROLE_REPOSITORY_TOKEN } from './interfaces/role-repository.interface';
import type { IRoleRepository } from './interfaces/role-repository.interface';
import { PERMISSION_REPOSITORY_TOKEN } from '../permissions/interfaces/permission-repository.interface';
import type { IPermissionRepository } from '../permissions/interfaces/permission-repository.interface';

@Injectable()
export class RolesService {

  constructor(
    @Inject(ROLE_REPOSITORY_TOKEN) private readonly roleRepository: IRoleRepository,
    @Inject(PERMISSION_REPOSITORY_TOKEN) private readonly permissionRepository: IPermissionRepository,
  ) {}


  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const name = createRoleDto.name.trim().toUpperCase();

    return await this.roleRepository.save({ name, description: createRoleDto.description });

  }


  findAll(isActive?: boolean): Promise<Role[]> {
    return this.roleRepository.findAll(isActive);

  }


  async remove(id: number): Promise<{ message: string }> {
    const result = await this.roleRepository.delete(id);

    if (!result.affected)
      throw new NotFoundException(`El rol con ID ${id} no existe`);

    return { message: `Rol con ID ${id} eliminado exitosamente` };

  }


  async toggleStatus(id: number): Promise<{ message: string; isActive: boolean }> {
    const role = await this.roleRepository.findById(id);

    if (!role)
      throw new NotFoundException(`El rol con ID ${id} no existe`);

    const newStatus = !role.isActive;
    await this.roleRepository.updateStatus(id, newStatus);

    return { message: `El rol ahora está ${newStatus ? 'activo' : 'inactivo'}`, isActive: newStatus };

  }


  async updatePermissions(id: number, permissionIds: number[]): Promise<Role> {
    const role = await this.roleRepository.findById(id);

    if (!role)
      throw new NotFoundException(`El rol con ID ${id} no existe`);

    const permissions = await this.permissionRepository.findByIds(permissionIds);

    if (permissions.length !== permissionIds.length)
      throw new NotFoundException('Uno o más permisos indicados no existen');

    return this.roleRepository.setPermissions(id, permissions);

  }

}
