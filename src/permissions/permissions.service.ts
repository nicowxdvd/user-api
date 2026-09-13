import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Permission } from './entities/permission.entity';
import { PERMISSION_REPOSITORY_TOKEN } from './interfaces/permission-repository.interface';
import type { IPermissionRepository } from './interfaces/permission-repository.interface';

@Injectable()
export class PermissionsService {

  constructor(
    @Inject(PERMISSION_REPOSITORY_TOKEN) private readonly permissionRepository: IPermissionRepository) 
  {}


  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const name = createPermissionDto.name.trim();
    return await this.permissionRepository.save({ name, description: createPermissionDto.description });

  }


  findAll(isActive?: boolean): Promise<Permission[]> {
    return this.permissionRepository.findAll(isActive);

  }


  async remove(id: number): Promise<{ message: string }> {
    const result = await this.permissionRepository.delete(id);
    if (!result.affected)
      throw new NotFoundException(`El permiso con ID ${id} no existe`);

    return { message: `Permiso con ID ${id} eliminado exitosamente` };

  }


  async toggleStatus(id: number): Promise<{ message: string; isActive: boolean }> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission)
      throw new NotFoundException(`El permiso con ID ${id} no existe`);

    const newStatus = !permission.isActive;
    await this.permissionRepository.updateStatus(id, newStatus);

    return { message: `El permiso ahora está ${newStatus ? 'activo' : 'inactivo'}`, isActive: newStatus };

  }

}
