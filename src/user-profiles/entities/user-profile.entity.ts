import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  // Referencia al UUID de users.id. Se declara como columna simple (sin
  // @OneToOne) para reproducir exactamente la DDL, que no define FK.
  @Column({ type: 'varchar', length: 36, name: 'user_id', unique: true })
  userId!: string;

  @Column({ type: 'varchar', length: 255, name: 'avatar_url', nullable: true })
  avatarUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  bio?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'char', length: 2, name: 'country_code', nullable: true })
  countryCode?: string | null;

  // TypeORM devuelve las columnas DATE como string 'YYYY-MM-DD'; se tipa así
  // para no arrastrar desfases de zona horaria al serializar.
  @Column({ type: 'date', name: 'birth_date', nullable: true })
  birthDate?: string | null;

  // Record<string, any> y no unknown: TypeORM exige que el tipo sea compatible
  // con QueryDeepPartialEntity al hacer update() sobre una columna JSON.
  @Column({ type: 'json', nullable: true })
  preferences?: Record<string, any> | null;

  @CreateDateColumn({ type: 'datetime', precision: 6, name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 6, name: 'updated_at' })
  updatedAt!: Date;
}
