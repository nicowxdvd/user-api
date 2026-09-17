export interface UserSummaryRole {
  id: number;
  name: string;
}

export class UserSummary {

  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly isActive: boolean,
    public readonly roleId: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly role?: UserSummaryRole,
  ) {}
}
