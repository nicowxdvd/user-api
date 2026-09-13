export interface JwtPayload {
  sub: string;
  email: string;
  roleId?: number;
  role?: string;
  permissions?: string[];
}
