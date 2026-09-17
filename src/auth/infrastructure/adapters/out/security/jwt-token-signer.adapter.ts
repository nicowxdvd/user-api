import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TokenSignerPort } from '../../../../domain/ports/out/token-signer.port';
import type { JwtPayload } from '../../../../domain/jwt-payload';

@Injectable()
export class JwtTokenSignerAdapter implements TokenSignerPort {

  constructor(private readonly jwtService: JwtService) {}


  sign(payload: JwtPayload): string {
    return this.jwtService.sign(payload);

  }

}
