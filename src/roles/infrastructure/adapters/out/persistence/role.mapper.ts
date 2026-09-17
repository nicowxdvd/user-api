import { Role } from '../../../../domain/entities/role.entity';
import { RoleOrmEntity } from './role.orm-entity';

export class RoleMapper {

  static toDomain(orm: RoleOrmEntity): Role {
    const permissions = orm.permissions?.map((permission) => ({ id: permission.id, name: permission.name }));
    return new Role(orm.name, orm.description, orm.isActive, orm.id, permissions);

  }


  static toPersistenceForCreate(role: Role): Partial<RoleOrmEntity> {
    return { name: role.name, description: role.description };

  }
}
