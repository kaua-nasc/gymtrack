import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TrainingPlanModule } from '@src/module/training-plan/training-plan.module';
import { createNestApp } from '@testInfra/test-e2e.setup';
import request from 'supertest';

describe('', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    const nestTestSetup = await createNestApp([TrainingPlanModule]);
    app = nestTestSetup.app;
    module = nestTestSetup.module;
  });

  beforeEach(async () => {
    jest.useFakeTimers({ advanceTimers: true }).setSystemTime(new Date('2023-01-01'));
  });

  afterEach(async () => {
    //await testDbClient(Tables.TrainingPlan).delete();
  });

  afterAll(async () => {
    await app.close();
    module.close();
  });

  it('', async () => {
    //await testDbClient(Tables.TrainingPlan).insert(trainingPlanFactory.build());

    const res = await request(app.getHttpServer()).get('/training-plan/list');

    expect(res.status).toBe(HttpStatus.OK);
  });
});
