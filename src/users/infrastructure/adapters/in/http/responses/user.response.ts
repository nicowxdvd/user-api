import { User } from '../../../../../domain/entities/user.entity';

export class UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleId: number | undefined;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(user: User): UserResponse {
    const response      = new UserResponse();
    response.id         = user.id!;
    response.email      = user.email;
    response.firstName  = user.firstName;
    response.lastName   = user.lastName;
    response.isActive   = user.isActive;
    response.roleId     = user.roleId;
    response.createdAt  = user.createdAt!;
    response.updatedAt  = user.updatedAt!;

    return response;

  }
}
