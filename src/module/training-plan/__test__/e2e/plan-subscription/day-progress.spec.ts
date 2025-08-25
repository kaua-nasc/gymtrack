import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TrainingPlanModule } from '@src/module/training-plan/training-plan.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import nock from 'nock';
import request from 'supertest';
import { planSubscriptionFactory } from '../../factory/plan-subscription.factory';
import { dayFactory } from '../../factory/day.factory';
import { trainingPlanFactory } from '../../factory/training-plan.factory';
import { userFactory } from '@src/module/identity/__test__/factory/user.factory';
import { PlanSubscriptionStatus } from '@src/module/training-plan/core/enum/plan-subscription-status.enum';

describe('Day Progress - Plan Subscription Controller - (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    const nestTestSetup = await createNestApp([TrainingPlanModule]);
    app = nestTestSetup.app;
    module = nestTestSetup.module;
  });

  beforeEach(async () => {
    await testDbClient(Tables.TrainingPlan).del();
    await testDbClient(Tables.PlanSubscription).del();
    await testDbClient(Tables.Day).del();
    await testDbClient(Tables.PlanDayProgress).del();
    nock.cleanAll();
  });

  afterAll(async () => {
    await testDbClient(Tables.TrainingPlan).del();
    await testDbClient(Tables.PlanSubscription).del();
    await testDbClient(Tables.Day).del();
    await testDbClient(Tables.PlanDayProgress).del();
    await module.close();
    await app.close();
    await testDbClient.destroy();
    nock.cleanAll();
  });

  describe('Create Day Progress', () => {
    it('should create a day progress', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const user = userFactory.build();
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.inProgress,
      });
      const day = dayFactory.build({ trainingPlanId: trainingPlan.id });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);
      await testDbClient(Tables.Day).insert(day);

      const res = await request(app.getHttpServer()).post(
        `/training-plan/subscription/day/progress/${planSubscription.id}/${day.id}`
      );

      expect(res.status).toBe(HttpStatus.CREATED);
    });
    it('should return not found status when have not plan subscription with status in progress', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const user = userFactory.build();
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.completed,
      });
      const day = dayFactory.build({ trainingPlanId: trainingPlan.id });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);
      await testDbClient(Tables.Day).insert(day);

      const res = await request(app.getHttpServer()).post(
        `/training-plan/subscription/day/progress/${planSubscription.id}/${day.id}`
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return not found status when plan subscription id is invalid', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const user = userFactory.build();
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.inProgress,
      });
      const day = dayFactory.build({ trainingPlanId: trainingPlan.id });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.Day).insert(day);

      const res = await request(app.getHttpServer()).post(
        `/training-plan/subscription/day/progress/${planSubscription.id}/${day.id}`
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return not found status when day id is invalid', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const user = userFactory.build();
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.inProgress,
      });
      const day = dayFactory.build({ trainingPlanId: trainingPlan.id });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      const res = await request(app.getHttpServer()).post(
        `/training-plan/subscription/day/progress/${planSubscription.id}/${day.id}`
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
