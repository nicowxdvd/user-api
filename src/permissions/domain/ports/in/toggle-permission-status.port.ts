export const TOGGLE_PERMISSION_STATUS_PORT = Symbol('TOGGLE_PERMISSION_STATUS_PORT');

export interface TogglePermissionStatusResult {
  message: string;
  isActive: boolean;
}

export interface TogglePermissionStatusPort {
  execute(id: number): Promise<TogglePermissionStatusResult>;
}
