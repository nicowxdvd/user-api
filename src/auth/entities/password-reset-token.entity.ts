import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken {
    @PrimaryGeneratedColumn('uuid')
    id: string | undefined;

    @Column({ type: 'varchar', name: 'token_hash', length: 64 })
    tokenHash: string | undefined;

    @Column({ type: 'varchar', name: 'user_id' })
    userId: string | undefined;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User | undefined;

    @Column({ type: 'datetime', name: 'expires_at' })
    expiresAt: Date | undefined;

    @Column({ type: 'datetime', name: 'used_at', nullable: true })
    usedAt: Date | null | undefined;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date | undefined;

}

