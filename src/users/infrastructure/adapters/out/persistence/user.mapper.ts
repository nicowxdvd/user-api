import { User } from '../../../../domain/entities/user.entity';
import { UserSummary } from '../../../../domain/entities/user-summary.entity';
import { UserOrmEntity } from './user.orm-entity';

export class UserMapper {

  static toDomain(orm: UserOrmEntity): User {
    return new User(orm.email!, orm.password, orm.firstName!, orm.lastName!, orm.roleId, orm.isActive, orm.id, orm.createdAt, orm.updatedAt);

  }


  static toSummary(orm: UserOrmEntity): UserSummary {
    return new UserSummary(
      orm.id!,
      orm.firstName!,
      orm.lastName!,
      orm.isActive!,
      orm.roleId!,
      orm.createdAt!,
      orm.updatedAt!,
      orm.role ? { id: orm.role.id, name: orm.role.name } : undefined,
    );

  }


  static toPersistenceForCreate(user: User): Partial<UserOrmEntity> {
    const orm: Partial<UserOrmEntity> = { email: user.email, password: user.password, firstName: user.firstName, lastName: user.lastName };

    if (user.roleId !== undefined)
      orm.roleId = user.roleId;

    return orm;

  }
}
