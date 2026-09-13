import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { IPermissionRepository } from '../interfaces/permission-repository.interface';

@Injectable()
export class PermissionRepository implements IPermissionRepository {

  constructor(@InjectRepository(Permission) private readonly typeormRepo: Repository<Permission>) {}


  async findById(id: number): Promise<Permission | null> {
    return await this.typeormRepo.findOneBy({ id });

  }


  async findByIds(ids: number[]): Promise<Permission[]> {
    if (!ids.length) return [];

    return await this.typeormRepo.findBy({ id: In(ids) });

  }


  async updateStatus(id: number, isActive: boolean): Promise<{ affected?: number | null }> {
    return await this.typeormRepo.update(id, { isActive });

  }


  async findAll(isActive?: boolean): Promise<Permission[]> {
    const where = isActive !== undefined ? { isActive } : {};
    return await this.typeormRepo.find({ where });

  }


  async save(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return await this.typeormRepo.save(createPermissionDto);

  }


  async isAssignedToAnyRole(name: string): Promise<boolean> {
    const count = await this.typeormRepo
      .createQueryBuilder('permission')
      .innerJoin('permission.roles', 'role')
      .where('permission.name = :name', { name })
      .getCount();

    return count > 0;

  }


  async delete(id: number): Promise<DeleteResult> {
    return await this.typeormRepo.delete(id);

  }

}
