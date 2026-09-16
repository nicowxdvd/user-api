import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository, UpdateResult } from 'typeorm';
import { IPasswordResetTokenRepository } from '../interfaces/password-reset-token-repository.interface';
import { PasswordResetToken } from '../entities/password-reset-token.entity';

@Injectable()
export class PasswordResetTokenRepository implements IPasswordResetTokenRepository {

  constructor(
    @InjectRepository(PasswordResetToken) private readonly typeormRepo: Repository<PasswordResetToken>)
  {}


  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<PasswordResetToken> {
    return await this.typeormRepo.save({ userId, tokenHash, expiresAt });

  }


  async findValidByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return await this.typeormRepo.findOneBy({ tokenHash, usedAt: IsNull(), expiresAt: MoreThan(new Date()) });

  }


  async markAsUsed(id: string): Promise<UpdateResult> {
    return this.typeormRepo.update({ id, usedAt: IsNull(), expiresAt: MoreThan(new Date()) }, { usedAt: new Date() });

  }


  async invalidateAllForUser(userId: string): Promise<UpdateResult> {
    return this.typeormRepo.update({ userId, usedAt: IsNull() }, { usedAt: new Date() });

  }

}
