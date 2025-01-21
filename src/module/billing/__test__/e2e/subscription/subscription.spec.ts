import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { PlanRepository } from '@src/module/billing/persistence/repository/plan.repository';
import { SubscriptionRepository } from '@src/module/billing/persistence/repository/subscription.repository';
import { BillingModule } from '@src/module/billing/billing.module';
import { PlanInterval, PlanModel } from '@src/module/billing/core/model/plan.model';
import { SubscriptionStatus } from '@src/module/billing/core/model/subscription.model';

describe('Subscription e2e test', () => {
  let app: INestApplication;
  let module: TestingModule;
  let planRepository: PlanRepository;
  let subscriptionRepository: SubscriptionRepository;

  beforeAll(async () => {
    const nestTestSetup = await createNestApp([BillingModule]);
    app = nestTestSetup.app;
    module = nestTestSetup.module;

    planRepository = module.get<PlanRepository>(PlanRepository);
    subscriptionRepository = module.get<SubscriptionRepository>(SubscriptionRepository);
  });

  beforeEach(async () => {
    jest.useFakeTimers({ advanceTimers: true }).setSystemTime(new Date('2023-01-01'));
  });

  afterEach(async () => {
    await subscriptionRepository.deleteAll();
    await planRepository.deleteAll();
  });

  afterAll(async () => {
    //TODO move it to be shared
    await app.close();
    module.close();
  });

  it('creates a subscription', async () => {
    const plan = PlanModel.create({
      name: 'Basic',
      description: 'Basic montly plan',
      currency: 'USD',
      amount: '10',
      trainingPlanQuantity: 10,
      interval: PlanInterval.Month,
      trialPeriod: 7,
    });
    planRepository.createPlan(plan);
    const res = await request(app.getHttpServer())
      .post('/subscription')
      .send({ planId: plan.id });
    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body).toEqual({
      id: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      deletedAt: null,
      userId: 'user-id',
      planId: plan.id,
      status: SubscriptionStatus.Active,
      startDate: expect.any(String),
      autoRenew: true,
    });
  });

  it('throws error if the plan does not exist', async () => {
    const res = await request(app.getHttpServer())
      .post('/subscription')
      .send({ planId: randomUUID() });
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });
});
