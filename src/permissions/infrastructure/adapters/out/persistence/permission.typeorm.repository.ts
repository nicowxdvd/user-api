import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from '../../../../domain/entities/permission.entity';
import type { DeleteOutcome, PermissionRepositoryPort } from '../../../../domain/ports/out/permission-repository.port';
import { PermissionOrmEntity } from './permission.orm-entity';
import { PermissionMapper } from './permission.mapper';

@Injectable()
export class PermissionTypeormRepository implements PermissionRepositoryPort {

  constructor(@InjectRepository(PermissionOrmEntity) private readonly typeormRepo: Repository<PermissionOrmEntity>) {}


  async findById(id: number): Promise<Permission | null> {
    const permission = await this.typeormRepo.findOneBy({ id });
    return permission ? PermissionMapper.toDomain(permission) : null;

  }


  async findByIds(ids: number[]): Promise<Permission[]> {
    if (!ids.length) return [];

    const rows = await this.typeormRepo.findBy({ id: In(ids) });
    return rows.map((row) => PermissionMapper.toDomain(row));

  }


  async findAll(isActive?: boolean): Promise<Permission[]> {
    const where = isActive !== undefined ? { isActive } : {};
    const rows  = await this.typeormRepo.find({ where });

    return rows.map((row) => PermissionMapper.toDomain(row));

  }


  async save(permission: Permission): Promise<Permission> {
    const saved = await this.typeormRepo.save(PermissionMapper.toPersistenceForCreate(permission));
    return PermissionMapper.toDomain(saved);

  }


  async updateStatus(id: number, isActive: boolean): Promise<DeleteOutcome> {
    return await this.typeormRepo.update(id, { isActive });

  }


  async isAssignedToAnyRole(name: string): Promise<boolean> {
    const count = await this.typeormRepo
      .createQueryBuilder('permission')
      .innerJoin('permission.roles', 'role')
      .where('permission.name = :name', { name })
      .getCount();

    return count > 0;

  }


  async delete(id: number): Promise<DeleteOutcome> {
    return await this.typeormRepo.delete(id);

  }
}
