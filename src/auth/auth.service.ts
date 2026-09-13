import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginResponse } from './interfaces/login-response.interface';
import { AUTH_REPOSITORY_TOKEN, type IAuthRepository } from './interfaces/auth-repository.interface';

@Injectable()
export class AuthService {

  constructor(private readonly jwtService: JwtService, @Inject(AUTH_REPOSITORY_TOKEN) private readonly authRepository: IAuthRepository) {}


  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const { email, password } = loginUserDto;

    const user = await this.authRepository.findByEmailWithPassword(email);

    if (!user?.password || !user.id || !user.email)
      throw new UnauthorizedException('Credenciales inválidas');

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Credenciales inválidas');

    if (!user.isActive)
      throw new UnauthorizedException('El usuario está inactivo');

    const permissions = user.role?.permissions?.filter((permission) => permission.isActive).map((permission) => permission.name) ?? [];

    const payload: JwtPayload = { sub: user.id, email: user.email, roleId: user.roleId, role: user.role?.name, permissions };

    return { access_token: this.jwtService.sign(payload) };

  }

}
