/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';
import { ROLE_REPOSITORY_TOKEN } from './interfaces/role-repository.interface';
import type { IRoleRepository } from './interfaces/role-repository.interface';
@Injectable()
export class RolesService {
  constructor(
    @Inject(ROLE_REPOSITORY_TOKEN)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const name = createRoleDto.name.trim().toUpperCase();
      return await this.roleRepository.save({
        name,
        description: createRoleDto.description,
      });
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        throw new ConflictException(
          `El rol '${createRoleDto.name}' ya existe.`,
        );
      }
      throw new InternalServerErrorException('Error al crear el rol');
    }
  }

  findAll(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const result = await this.roleRepository.delete(id);
      if (!result || result.affected === 0) {
        throw new NotFoundException(`El rol con ID ${id} no existe`);
      }
      return { message: `Rol con ID ${id} eliminado exitosamente` };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error?.errno === 1451 || error?.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException(
          'No se puede eliminar el rol porque tiene usuarios asignados',
        );
      }

      throw new InternalServerErrorException('Error al eliminar el rol');
    }
  }
}
