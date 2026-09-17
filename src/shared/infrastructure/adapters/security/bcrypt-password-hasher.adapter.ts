import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { PasswordHasherPort } from '../../../domain/ports/password-hasher.port';

const SALT_ROUNDS = 10;

@Injectable()
export class BcryptPasswordHasherAdapter implements PasswordHasherPort {

  async hash(plainText: string): Promise<string> {
    return await bcrypt.hash(plainText, SALT_ROUNDS);

  }


  async compare(plainText: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plainText, hash);

  }
}
