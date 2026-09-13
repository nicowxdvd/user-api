import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard, JwtService, Reflector],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);

  });

  it('should be defined', () => {
    expect(guard).toBeDefined();

  });
});
