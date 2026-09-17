import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import type { TokenGeneratorPort } from '../../../domain/ports/token-generator.port';

const TOKEN_BYTES = 32;

@Injectable()
export class CryptoTokenGeneratorAdapter implements TokenGeneratorPort {

  generate(): string {
    return randomBytes(TOKEN_BYTES).toString('hex');

  }


  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');

  }
}
