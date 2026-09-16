import { UpdateResult } from 'typeorm';
import { PasswordResetToken } from '../entities/password-reset-token.entity';

export const PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN = Symbol('PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN');

export interface IPasswordResetTokenRepository {
  create(userId: string, tokenHash: string, expiresAt: Date)    : Promise<PasswordResetToken>;
  findValidByHash(tokenHash: string)                            : Promise<PasswordResetToken | null>;
  markAsUsed(id: string)                                        : Promise<UpdateResult>;
  invalidateAllForUser(userId: string)                          : Promise<UpdateResult>;

}