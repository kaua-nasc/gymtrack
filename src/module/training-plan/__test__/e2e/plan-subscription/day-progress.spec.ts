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
import { planSubscriptionFactory } from '../../factory/plan-subscription.factory';
import { trainingPlanFactory } from '../../factory/training-plan.factory';

describe.skip('Day Progress - Plan Subscription Controller - (e2e)', () => {
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
    await testDbClient(Tables.TrainingPlan).del();
    await testDbClient(Tables.PlanSubscription).del();
    await testDbClient(Tables.Day).del();
    await testDbClient(Tables.PlanDayProgress).del();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(async () => {
    if (module) {
      await testDbClient(Tables.TrainingPlan).del();
      await testDbClient(Tables.PlanSubscription).del();
      await testDbClient(Tables.Day).del();
      await testDbClient(Tables.PlanDayProgress).del();
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

      await testDbClient(Tables.User).insert(user);
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);
      await testDbClient(Tables.Day).insert(day);

      const res = await fetch(`${url}/training-plan/subscriptions/day/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
      });

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

      const res = await fetch(`${url}/training-plan/subscriptions/day/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
      });

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

      const res = await fetch(
        `${url}/training-plan/subscriptions/day/progress/${planSubscription.id}/${day.id}`,
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

    it('should return not found status when day id is invalid', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const user = userFactory.build();
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.inProgress,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      const res = await fetch(`${url}/training-plan/subscriptions/day/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
      });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
