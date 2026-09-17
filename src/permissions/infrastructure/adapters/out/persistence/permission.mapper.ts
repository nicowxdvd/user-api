import { Permission } from '../../../../domain/entities/permission.entity';
import { PermissionOrmEntity } from './permission.orm-entity';

export class PermissionMapper {

  static toDomain(orm: PermissionOrmEntity): Permission {
    return new Permission(orm.name, orm.description, orm.isActive, orm.id);

  }


  static toPersistenceForCreate(permission: Permission): Partial<PermissionOrmEntity> {
    return { name: permission.name, description: permission.description };

  }
}
