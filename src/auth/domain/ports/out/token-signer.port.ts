import type { JwtPayload } from '../../jwt-payload';

export const TOKEN_SIGNER_PORT = Symbol('TOKEN_SIGNER_PORT');

export interface TokenSignerPort {
  sign(payload: JwtPayload): string;
}
