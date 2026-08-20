import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginResponse } from './interfaces/login-response.interface';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(loginUserDto: LoginUserDto): LoginResponse {
    if (
      loginUserDto.username !== 'nico' ||
      loginUserDto.password !== '_nico_123'
    ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: 1, username: loginUserDto.username };

    return { access_token: this.jwtService.sign<JwtPayload>(payload) };
  }
}
