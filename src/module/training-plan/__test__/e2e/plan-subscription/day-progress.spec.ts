import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'bun:test';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { userFactory } from '@src/module/identity/__test__/factory/user.factory';
import { PlanSubscriptionStatus } from '@src/module/training-plan/core/enum/plan-subscription-status.enum';
import { TrainingPlanModule } from '@src/module/training-plan/training-plan.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { sign } from 'jsonwebtoken';
import { SetupServerApi } from 'msw/node';
import { dayFactory } from '../../factory/day.factory';
import { planDayProgressFactory } from '../../factory/plan-day-progress.factory';
import { planSubscriptionFactory } from '../../factory/plan-subscription.factory';
import { trainingPlanFactory } from '../../factory/training-plan.factory';

describe('Day Progress - Plan Subscription Controller - (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let url: string;
  let server: SetupServerApi;
  let configuration: { [key: string]: string | number | undefined };

  beforeAll(async () => {
    const setup = await createNestApp([TrainingPlanModule]);
    app = setup.app;
    module = setup.module;
    configuration = setup.configuration;
    server = setup.server;
    await app.listen(0);

    url = await app.getUrl();
  });

  beforeEach(async () => {
    await testDbClient(Tables.PlanDayProgress).del();
    await testDbClient(Tables.PlanSubscription).del();
    await testDbClient(Tables.Day).del();
    await testDbClient(Tables.TrainingPlan).del();
    await testDbClient(Tables.User).del();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(async () => {
    if (module) {
      await testDbClient(Tables.PlanDayProgress).del();
      await testDbClient(Tables.PlanSubscription).del();
      await testDbClient(Tables.Day).del();
      await testDbClient(Tables.TrainingPlan).del();
      await testDbClient(Tables.User).del();
      await module.close();
    }

    if (app) {
      await app.close();
    }
  });

  const getAuthorizationHeader = (userId: string) => {
    return {
      Authorization: `Bearer ${sign(
        {
          sub: userId,
        },
        configuration['auth.jwtSecret'] as string
      )}`,
    };
  };

  describe('POST /training-plan/subscriptions/:planSubscriptionId/day/:dayId/progress', () => {
    it('should create a day progress successfully', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      const day = dayFactory.build({ trainingPlanId: trainingPlan.id });
      await testDbClient(Tables.Day).insert(day);

      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.inProgress,
      });
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      const res = await fetch(
        `${url}/training-plan/subscriptions/${planSubscription.id}/day/${day.id}/progress`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.CREATED);
      const progress = await testDbClient(Tables.PlanDayProgress).select('*');
      expect(progress).toHaveLength(1);
    });

    it('should return not found when subscription is not in progress', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      const day = dayFactory.build({ trainingPlanId: trainingPlan.id });
      await testDbClient(Tables.Day).insert(day);

      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.notStarted,
      });
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      const res = await fetch(
        `${url}/training-plan/subscriptions/${planSubscription.id}/day/${day.id}/progress`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /training-plan/subscriptions/day/progress', () => {
    it('should return progress for the in-progress subscription', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      const day = dayFactory.build({ trainingPlanId: trainingPlan.id });
      await testDbClient(Tables.Day).insert(day);

      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.inProgress,
      });
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      const planDayProgress = planDayProgressFactory.build({
        planSubscriptionId: planSubscription.id,
        dayId: day.id,
      });

      await testDbClient(Tables.PlanDayProgress).insert(planDayProgress);

      const res = await fetch(`${url}/training-plan/subscriptions/day/progress`, {
        headers: {
          ...getAuthorizationHeader(user.id!),
        },
      });

      expect(res.status).toBe(HttpStatus.OK);
      const body = await res.json();
      expect(body).toHaveLength(1);
    });
  });
});
