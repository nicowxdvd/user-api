import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OneToMany } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];
}
