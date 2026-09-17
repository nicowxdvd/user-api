export const PASSWORD_RESET_TOKEN_REPOSITORY_PORT = Symbol('PASSWORD_RESET_TOKEN_REPOSITORY_PORT');

export interface UpdateOutcome {
  affected: number;
}

export interface PasswordResetTokenRepositoryPort {
  create(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  findValidByHash(tokenHash: string): Promise<{ id: string; userId: string } | null>;
  markAsUsed(id: string): Promise<UpdateOutcome>;
  invalidateAllForUser(userId: string): Promise<void>;
}
