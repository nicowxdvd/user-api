import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({ controllers: [HealthController] }).compile();

    healthController = app.get<HealthController>(HealthController);

  });

  describe('check', () => {
    it('debe devolver el estado "ok"', () => {
      expect(healthController.check()).toEqual({ status: 'ok' });

    });
  });
});
