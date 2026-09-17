import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { RoleOrmEntity } from '../../../../../roles/infrastructure/adapters/out/persistence/role.orm-entity';

@Entity('permissions')
export class PermissionOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @ManyToMany(() => RoleOrmEntity, (role) => role.permissions)
  roles!: RoleOrmEntity[];
}
