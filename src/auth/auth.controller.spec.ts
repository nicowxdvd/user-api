import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };

  beforeEach(async () => {
    authService = { login: jest.fn().mockResolvedValue({ access_token: 'token-firmado' }) };

    const module: TestingModule = await Test
      .createTestingModule({ controllers: [AuthController], providers: [{ provide: AuthService, useValue: authService }] })
      .overrideGuard(ThrottlerGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);

  });

  it('should be defined', () => {
    expect(controller).toBeDefined();

  });

  it('delega el login en AuthService', async () => {
    const loginUserDto = { email: 'nico@correo.com', password: 'contrasena-correcta' };

    await expect(controller.login(loginUserDto)).resolves.toEqual({ access_token: 'token-firmado' });
    expect(authService.login).toHaveBeenCalledWith(loginUserDto);

  });
});
