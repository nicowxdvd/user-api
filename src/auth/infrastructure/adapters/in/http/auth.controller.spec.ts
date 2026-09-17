import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { LOGIN_PORT } from '../../../../domain/ports/in/login.port';
import { FORGOT_PASSWORD_PORT } from '../../../../domain/ports/in/forgot-password.port';
import { RESET_PASSWORD_PORT } from '../../../../domain/ports/in/reset-password.port';

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    loginUseCase = { execute: jest.fn().mockResolvedValue({ access_token: 'token-firmado' }) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: LOGIN_PORT, useValue: loginUseCase },
        { provide: FORGOT_PASSWORD_PORT, useValue: { execute: jest.fn() } },
        { provide: RESET_PASSWORD_PORT, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);

  });

  it('should be defined', () => {
    expect(controller).toBeDefined();

  });

  it('delega el login en el caso de uso', async () => {
    const loginUserDto = { email: 'nico@correo.com', password: 'contrasena-correcta' };

    await expect(controller.login(loginUserDto)).resolves.toEqual({ access_token: 'token-firmado' });
    expect(loginUseCase.execute).toHaveBeenCalledWith(loginUserDto);

  });

});
