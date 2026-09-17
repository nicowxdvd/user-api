import { Module } from '@nestjs/common';
import { PASSWORD_HASHER_PORT } from './domain/ports/password-hasher.port';
import { TOKEN_GENERATOR_PORT } from './domain/ports/token-generator.port';
import { BcryptPasswordHasherAdapter } from './infrastructure/adapters/security/bcrypt-password-hasher.adapter';
import { CryptoTokenGeneratorAdapter } from './infrastructure/adapters/security/crypto-token-generator.adapter';

@Module({
  providers: [
    { provide: PASSWORD_HASHER_PORT, useClass: BcryptPasswordHasherAdapter },
    { provide: TOKEN_GENERATOR_PORT, useClass: CryptoTokenGeneratorAdapter },
  ],
  exports: [PASSWORD_HASHER_PORT, TOKEN_GENERATOR_PORT],
})
export class SharedModule {}
