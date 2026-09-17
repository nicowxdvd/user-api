export class Permission {

  constructor(
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly isActive: boolean = true,
    public readonly id?: number,
  ) {}


  toggleStatus(): Permission {
    return new Permission(this.name, this.description, !this.isActive, this.id);

  }
}
