export const TOGGLE_ROLE_STATUS_PORT = Symbol('TOGGLE_ROLE_STATUS_PORT');

export interface ToggleRoleStatusResult {
  message: string;
  isActive: boolean;
}

export interface ToggleRoleStatusPort {
  execute(id: number): Promise<ToggleRoleStatusResult>;
}
