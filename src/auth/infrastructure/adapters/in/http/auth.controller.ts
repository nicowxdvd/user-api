import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LOGIN_PORT } from '../../../../domain/ports/in/login.port';
import type { LoginPort } from '../../../../domain/ports/in/login.port';
import { FORGOT_PASSWORD_PORT } from '../../../../domain/ports/in/forgot-password.port';
import type { ForgotPasswordPort } from '../../../../domain/ports/in/forgot-password.port';
import { RESET_PASSWORD_PORT } from '../../../../domain/ports/in/reset-password.port';
import type { ResetPasswordPort } from '../../../../domain/ports/in/reset-password.port';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

  constructor(
    @Inject(LOGIN_PORT) private readonly loginUseCase: LoginPort,
    @Inject(FORGOT_PASSWORD_PORT) private readonly forgotPasswordUseCase: ForgotPasswordPort,
    @Inject(RESET_PASSWORD_PORT) private readonly resetPasswordUseCase: ResetPasswordPort,
  ) {}


  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.loginUseCase.execute(loginUserDto);

  }


  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(forgotPasswordDto);

  }


  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute(resetPasswordDto);

  }

}
