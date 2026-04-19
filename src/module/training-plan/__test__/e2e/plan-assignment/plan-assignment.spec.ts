import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { trainingPlanFactory } from '@src/module/training-plan/__test__/factory/training-plan.factory';
import { TrainingPlanModule } from '@src/module/training-plan/training-plan.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { sign } from 'jsonwebtoken';
import { http, HttpResponse } from 'msw';
import { PlanSubscriptionType } from '@src/module/training-plan/core/enum/plan-subscription-type.enum';

describe('Training Plan - Plan Assignment - (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let url: string;
  let configuration: { [key: string]: string | number | undefined };
  let server: any;

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
    await testDbClient(Tables.PlanSubscription).del();
    await testDbClient(Tables.TrainingPlan).del();
  });

  afterAll(async () => {
    if (module) {
      await testDbClient(Tables.PlanSubscription).del();
      await testDbClient(Tables.TrainingPlan).del();
      await module.close();
    }
    if (app) {
      await app.close();
    }
  });

  const getAuthorizationHeader = (userId: string, type: UserType) => {
    return {
      Authorization: `Bearer ${sign(
        {
          sub: userId,
          type,
        },
        configuration['auth.jwtSecret'] as string
      )}`,
    };
  };

  describe('POST /training-plan/subscriptions/assign', () => {
    it('should allow trainer to assign their own plan to a linked student', async () => {
      const trainerId = crypto.randomUUID();
      const studentId = crypto.randomUUID();

      const plan = trainingPlanFactory.build({ authorId: trainerId });
      await testDbClient(Tables.TrainingPlan).insert(plan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/student/${studentId}/trainer-id`,
          () => HttpResponse.json({ trainerId })
        ),
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${trainerId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(`${url}/training-plan/subscriptions/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(trainerId, UserType.personalTrainer),
        },
        body: JSON.stringify({
          studentId,
          planId: plan.id,
          type: PlanSubscriptionType.totalAccess,
        }),
      });

      expect(response.status).toBe(HttpStatus.CREATED);

      const [subscription] = await testDbClient(Tables.PlanSubscription)
        .select('*')
        .where({ userId: studentId, trainingPlanId: plan.id });

      expect(subscription).toBeDefined();
      expect(subscription.status).toBe('NOT_STARTED');
    });

    it('should return 400 when trainer is not officially linked to student', async () => {
      const trainerId = crypto.randomUUID();
      const anotherTrainerId = crypto.randomUUID();
      const studentId = crypto.randomUUID();

      const plan = trainingPlanFactory.build({ authorId: trainerId });
      await testDbClient(Tables.TrainingPlan).insert(plan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/student/${studentId}/trainer-id`,
          () => HttpResponse.json({ trainerId: anotherTrainerId })
        )
      );

      const response = await fetch(`${url}/training-plan/subscriptions/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(trainerId, UserType.personalTrainer),
        },
        body: JSON.stringify({
          studentId,
          planId: plan.id,
          type: PlanSubscriptionType.totalAccess,
        }),
      });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      const body = (await response.json()) as { message: string };
      expect(body.message).toContain('not your linked student');
    });

    it('should return 400 when trainer tries to assign a plan not owned by them', async () => {
      const trainerId = crypto.randomUUID();
      const studentId = crypto.randomUUID();
      const ownerId = crypto.randomUUID();

      const plan = trainingPlanFactory.build({ authorId: ownerId });
      await testDbClient(Tables.TrainingPlan).insert(plan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/student/${studentId}/trainer-id`,
          () => HttpResponse.json({ trainerId })
        )
      );

      const response = await fetch(`${url}/training-plan/subscriptions/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(trainerId, UserType.personalTrainer),
        },
        body: JSON.stringify({
          studentId,
          planId: plan.id,
          type: PlanSubscriptionType.totalAccess,
        }),
      });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(((await response.json()) as { message: string }).message).toContain(
        'created by yourself'
      );
    });

    it('should return 403 when CLIENT tries to access assignment endpoint', async () => {
      const clientId = crypto.randomUUID();

      const response = await fetch(`${url}/training-plan/subscriptions/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(clientId, UserType.client),
        },
        body: JSON.stringify({
          studentId: crypto.randomUUID(),
          planId: crypto.randomUUID(),
          type: PlanSubscriptionType.totalAccess,
        }),
      });

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });
  });
});
