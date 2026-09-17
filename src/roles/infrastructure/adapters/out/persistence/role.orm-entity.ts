import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { UserOrmEntity } from '../../../../../users/infrastructure/adapters/out/persistence/user.orm-entity';
import { PermissionOrmEntity } from '../../../../../permissions/infrastructure/adapters/out/persistence/permission.orm-entity';

@Entity('roles')
export class RoleOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @OneToMany(() => UserOrmEntity, (user) => user.role)
  users!: UserOrmEntity[];

  @ManyToMany(() => PermissionOrmEntity, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: PermissionOrmEntity[];
}
