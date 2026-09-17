export const DELETE_ROLE_PORT = Symbol('DELETE_ROLE_PORT');

export interface DeleteRoleResult {
  message: string;
}

export interface DeleteRolePort {
  execute(id: number): Promise<DeleteRoleResult>;
}
