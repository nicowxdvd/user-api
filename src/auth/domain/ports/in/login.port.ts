export const LOGIN_PORT = Symbol('LOGIN_PORT');

export interface LoginCommand {
  email: string;
  password: string;
}

export interface LoginResult {
  access_token: string;
}

export interface LoginPort {
  execute(command: LoginCommand): Promise<LoginResult>;
}
