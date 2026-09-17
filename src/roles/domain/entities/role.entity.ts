export interface RolePermission {
  id: number;
  name: string;
}

export class Role {

  constructor(
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly isActive: boolean = true,
    public readonly id?: number,
    public readonly permissions?: RolePermission[],
  ) {}


  toggleStatus(): Role {
    return new Role(this.name, this.description, !this.isActive, this.id, this.permissions);

  }
}
