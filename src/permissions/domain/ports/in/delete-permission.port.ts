export const DELETE_PERMISSION_PORT = Symbol('DELETE_PERMISSION_PORT');

export interface DeletePermissionResult {
  message: string;
}

export interface DeletePermissionPort {
  execute(id: number): Promise<DeletePermissionResult>;
}
