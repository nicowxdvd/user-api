import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../roles/entities/role.entity';

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

  // 'boolean' se traduce a tinyint(1) en MySQL y es lo que hace que TypeORM
  // convierta el 1/0 del motor a true/false al hidratar la entidad. Con
  // 'varchar' no había conversión y la propiedad recibía el string '1'.
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean | undefined;

  @Column({ type: 'int', name: 'role_id' })
  roleId: number | undefined;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date | undefined;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role | undefined;
}
