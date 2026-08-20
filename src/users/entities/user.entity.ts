import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string | undefined;

  @Column({ type: 'varchar', unique: true, length: 150 })
  email: string | undefined;

  @Column({ type: 'varchar', select: false })
  @Exclude()
  password: string | undefined;

  @Column({ type: 'varchar', name: 'first_name', nullable: true })
  firstName: string = '';

  @Column({ type: 'varchar', name: 'last_name', nullable: true })
  lastName: string | undefined;

  @Column({ type: 'varchar', name: 'is_active', default: true })
  isActive: boolean | undefined;

  @Column({ type: 'tinyint', name: 'role_id' })
  roleId: number | undefined;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date | undefined;
}
