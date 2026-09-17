export class User {

  constructor(
    public readonly email: string,
    public readonly password: string | undefined,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly roleId: number | undefined,
    public readonly isActive: boolean = true,
    public readonly id?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}


  toggleStatus(): User {
    return new User(this.email, this.password, this.firstName, this.lastName, this.roleId, !this.isActive, this.id, this.createdAt, this.updatedAt);

  }
}
