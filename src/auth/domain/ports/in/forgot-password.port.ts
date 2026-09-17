export const FORGOT_PASSWORD_PORT = Symbol('FORGOT_PASSWORD_PORT');

export interface ForgotPasswordCommand {
  email: string;
}

export interface ForgotPasswordResult {
  message: string;
}

export interface ForgotPasswordPort {
  execute(command: ForgotPasswordCommand): Promise<ForgotPasswordResult>;
}
