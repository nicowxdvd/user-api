import { UserSummary, UserSummaryRole } from '../../../../../domain/entities/user-summary.entity';

export class UserSummaryResponse {
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleId: number;
  createdAt: Date;
  updatedAt: Date;
  role?: UserSummaryRole;

  static fromDomain(user: UserSummary): UserSummaryResponse {
    const response      = new UserSummaryResponse();
    response.id         = user.id;
    response.firstName  = user.firstName;
    response.lastName   = user.lastName;
    response.isActive   = user.isActive;
    response.roleId     = user.roleId;
    response.createdAt  = user.createdAt;
    response.updatedAt  = user.updatedAt;
    response.role       = user.role;

    return response;

  }
}
