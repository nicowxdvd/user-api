import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../../../domain/entities/role.entity';
import type { DeleteOutcome, RoleRepositoryPort } from '../../../../domain/ports/out/role-repository.port';
import { RoleOrmEntity } from './role.orm-entity';
import { PermissionOrmEntity } from '../../../../../permissions/infrastructure/adapters/out/persistence/permission.orm-entity';
import { RoleMapper } from './role.mapper';

@Injectable()
export class RoleTypeormRepository implements RoleRepositoryPort {

  constructor(@InjectRepository(RoleOrmEntity) private readonly typeormRepo: Repository<RoleOrmEntity>) {}


  async findById(id: number): Promise<Role | null> {
    const role = await this.typeormRepo.findOneBy({ id });
    return role ? RoleMapper.toDomain(role) : null;

  }


  async findAll(isActive?: boolean): Promise<Role[]> {
    const where = isActive !== undefined ? { isActive } : {};
    const rows  = await this.typeormRepo.find({ where });

    return rows.map((row) => RoleMapper.toDomain(row));

  }


  async save(role: Role): Promise<Role> {
    const saved = await this.typeormRepo.save(RoleMapper.toPersistenceForCreate(role));
    return RoleMapper.toDomain(saved);

  }


  async updateStatus(id: number, isActive: boolean): Promise<DeleteOutcome> {
    return await this.typeormRepo.update(id, { isActive });

  }


  async setPermissions(id: number, permissionIds: number[]): Promise<Role> {
    const permissions = permissionIds.map((permissionId) => ({ id: permissionId }) as PermissionOrmEntity);
    await this.typeormRepo.save({ id, permissions });

    const updated = await this.typeormRepo.findOne({ where: { id }, relations: { permissions: true } });
    return RoleMapper.toDomain(updated!);

  }


  async delete(id: number): Promise<DeleteOutcome> {
    return await this.typeormRepo.delete(id);

  }
}
