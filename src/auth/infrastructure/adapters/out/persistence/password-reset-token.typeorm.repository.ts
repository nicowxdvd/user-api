import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { PasswordResetTokenOrmEntity } from './password-reset-token.orm-entity';
import type { PasswordResetTokenRepositoryPort, UpdateOutcome } from '../../../../domain/ports/out/password-reset-token-repository.port';

@Injectable()
export class PasswordResetTokenTypeormRepository implements PasswordResetTokenRepositoryPort {

  constructor(@InjectRepository(PasswordResetTokenOrmEntity) private readonly typeormRepo: Repository<PasswordResetTokenOrmEntity>) {}


  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.typeormRepo.save({ userId, tokenHash, expiresAt });

  }


  async findValidByHash(tokenHash: string): Promise<{ id: string; userId: string } | null> {
    const resetToken = await this.typeormRepo.findOneBy({ tokenHash, usedAt: IsNull(), expiresAt: MoreThan(new Date()) });
    if (!resetToken?.id || !resetToken.userId)
      return null;

    return { id: resetToken.id, userId: resetToken.userId };

  }


  async markAsUsed(id: string): Promise<UpdateOutcome> {
    const { affected } = await this.typeormRepo.update({ id, usedAt: IsNull(), expiresAt: MoreThan(new Date()) }, { usedAt: new Date() });
    return { affected: affected ?? 0 };

  }


  async invalidateAllForUser(userId: string): Promise<void> {
    await this.typeormRepo.update({ userId, usedAt: IsNull() }, { usedAt: new Date() });

  }

}
