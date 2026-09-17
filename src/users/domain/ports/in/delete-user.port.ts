export const DELETE_USER_PORT = Symbol('DELETE_USER_PORT');

export interface DeleteUserResult {
  message: string;
}

export interface DeleteUserPort {
  execute(id: string): Promise<DeleteUserResult>;
}
