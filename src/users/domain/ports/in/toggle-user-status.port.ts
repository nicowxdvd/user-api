export const TOGGLE_USER_STATUS_PORT = Symbol('TOGGLE_USER_STATUS_PORT');

export interface ToggleUserStatusResult {
  message: string;
  isActive: boolean;
}

export interface ToggleUserStatusPort {
  execute(id: string): Promise<ToggleUserStatusResult>;
}
