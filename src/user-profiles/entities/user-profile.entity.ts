import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserOrmEntity } from '../../users/infrastructure/adapters/out/persistence/user.orm-entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 36, name: 'user_id', unique: true })
  userId!: string;

  // Relación 1 a 1 sobre la misma columna `user_id`: el borrado en cascada lo
  // resuelve MySQL vía FK, sin transacciones manuales entre módulos. Mismo
  // patrón que `User.roleId` + `User.role` sobre `role_id`.
  @OneToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserOrmEntity;

  @Column({ type: 'varchar', length: 255, name: 'avatar_url', nullable: true })
  avatarUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  bio?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'char', length: 2, name: 'country_code', nullable: true })
  countryCode?: string | null;

  @Column({ type: 'date', name: 'birth_date', nullable: true })
  birthDate?: string | null;

  @Column({ type: 'json', nullable: true })
  preferences?: Record<string, any> | null;

  @CreateDateColumn({ type: 'datetime', precision: 6, name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 6, name: 'updated_at' })
  updatedAt!: Date;
}
