export const TOKEN_GENERATOR_PORT = Symbol('TOKEN_GENERATOR_PORT');

export interface TokenGeneratorPort {
  generate(): string;
  hash(token: string): string;
}
