export const AUTH_REPOSITORY_PORT = Symbol('AUTH_REPOSITORY_PORT');

export interface AuthUserSnapshot {
  id: string;
  email: string;
  password: string;
  isActive: boolean;
  roleId?: number;
  roleName?: string;
  rolePermissions: { name: string; isActive: boolean }[];
}

export interface AuthRepositoryPort {
  findByEmailWithPassword(email: string): Promise<AuthUserSnapshot | null>;
  findByEmail(email: string): Promise<{ id: string; isActive: boolean } | null>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
}
