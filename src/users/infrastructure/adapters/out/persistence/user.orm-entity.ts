import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { RoleOrmEntity } from '../../../../../roles/infrastructure/adapters/out/persistence/role.orm-entity';

@Entity('users')
@Index(['createdAt', 'id'])
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string | undefined;

  @Column({ type: 'varchar', unique: true, length: 150 })
  email: string | undefined;

  @Column({ type: 'varchar', select: false })
  password: string | undefined;

  @Column({ type: 'varchar', name: 'first_name' })
  firstName: string | undefined;

  @Column({ type: 'varchar', name: 'last_name' })
  lastName: string | undefined;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean | undefined;

  @Column({ type: 'int', name: 'role_id', default: 11 })
  roleId: number | undefined;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date | undefined;

  @ManyToOne(() => RoleOrmEntity, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: RoleOrmEntity | undefined;
}
