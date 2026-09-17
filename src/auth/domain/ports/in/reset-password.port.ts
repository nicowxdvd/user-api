export const RESET_PASSWORD_PORT = Symbol('RESET_PASSWORD_PORT');

export interface ResetPasswordCommand {
  newPassword: string;
  token: string;
}

export interface ResetPasswordResult {
  message: string;
}

export interface ResetPasswordPort {
  execute(command: ResetPasswordCommand): Promise<ResetPasswordResult>;
}
