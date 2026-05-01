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
import { JwtService } from '@nestjs/jwt';
import { TestingModule } from '@nestjs/testing';
import { userFactory } from '@src/module/identity/__test__/factory/user.factory';
import { PlanSubscriptionStatus } from '@src/module/training-plan/core/enum/plan-subscription-status.enum';
import { PlanSubscriptionType } from '@src/module/training-plan/core/enum/plan-subscription-type.enum';
import { TrainingPlanModule } from '@src/module/training-plan/training-plan.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { HttpResponse, http } from 'msw';
import { SetupServer } from 'msw/node';
import { planSubscriptionFactory } from '../../factory/plan-subscription.factory';
import { trainingPlanFactory } from '../../factory/training-plan.factory';

describe('Plan Subscription - Plan Subscription Controller - (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let url: string;
  let server: SetupServer;
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
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(async () => {
    if (module) {
      await testDbClient(Tables.TrainingPlan).del();
      await testDbClient(Tables.PlanSubscription).del();
      await module.close();
    }

    if (app) {
      await app.close();
    }
  });

  const getAuthorizationHeader = (userId: string) => {
    return {
      Authorization: `Bearer ${new JwtService().sign(
        {
          sub: userId,
        },
        { secret: configuration['auth.jwtSecret'] as string }
      )}`,
    };
  };

  describe('Create Subscription', () => {
    it('should create a plan subscription successfully', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build();

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(`${url}/training-plan/${trainingPlan.id}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({ type: 'TOTAL_ACCESS' }),
      });

      expect(res.status).toBe(HttpStatus.CREATED);
    });

    it('should return a not found status code when have not user with filled id', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({
        authorId: user.id,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${trainingPlan.authorId}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const res = await fetch(`${url}/training-plan/${trainingPlan.id}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(trainingPlan.authorId!),
        },
        body: JSON.stringify({ type: 'TOTAL_ACCESS' }),
      });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return a not found status code when have not training plan with filled id', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const user = userFactory.build();

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const res = await fetch(`${url}/training-plan/${trainingPlan.id}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({ type: 'TOTAL_ACCESS' }),
      });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return a conflict status code when already have a subscription with filled training plan and user', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.notStarted,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(`${url}/training-plan/${trainingPlan.id}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({ type: 'TOTAL_ACCESS' }),
      });

      expect(res.status).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('Delete Subscription', () => {
    it('should return ok status code when delete a subscription with plan subscription status equals not started', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.notStarted,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(`${url}/training-plan/${trainingPlan.id}/subscriptions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
      });

      expect(res.status).toBe(HttpStatus.OK);
    });
    it('should return ok status code when delete a subscription with plan subscription status equals canceled', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.canceled,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(`${url}/training-plan/${trainingPlan.id}/subscriptions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
      });

      expect(res.status).toBe(HttpStatus.OK);
    });
    it('should return ok status code when delete a subscription', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.notStarted,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(`${url}/training-plan/${trainingPlan.id}/subscriptions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
      });

      expect(res.status).toBe(HttpStatus.OK);
    });
    it('should return not found status code when delete a subscription with invalid user id', async () => {
      const user = userFactory.build();
      const anotherUser = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: anotherUser.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.notStarted,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const res = await fetch(`${url}/training-plan/${trainingPlan.id}/subscriptions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
      });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return not found status code when delete a subscription with invalid plan subscription id', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(`${url}/training-plan/${trainingPlan.id}/subscriptions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
      });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return bad request status code when delete a subscription with subscription status is in progress', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.inProgress,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(`${url}/training-plan/${trainingPlan.id}/subscriptions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
      });

      const body = (await res.json()) as { message: string };

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(body.message).toBe('cannot delete a subscription with status IN_PROGRESS');
    });
    it('should return bad request status code when delete a subscription with subscription status is completed', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.completed,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(`${url}/training-plan/${trainingPlan.id}/subscriptions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
      });

      const body = (await res.json()) as { message: string };

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(body.message).toBe('cannot delete a subscription with status COMPLETED');
    });
  });

  describe('Update Subscription to In Progress', () => {
    it('should update a plan subscription to in progress successfully when status is not started', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.notStarted,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/in-progress`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return a not found status code when plan subscription to in progress badly with invalid user id', async () => {
      const user = userFactory.build({
        id: '00000000-0000-0000-0000-000000000001',
      });
      const anotherUser = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: anotherUser.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.notStarted,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/in-progress`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return a not found status code when plan subscription to in progress badly with invalid plan subscription id', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/in-progress`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return a bad request when plan subscription status is in progress', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.inProgress,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/in-progress`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return a bad request when plan subscription status is completed', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.completed,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/in-progress`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return a bad request when plan subscription status is canceled', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.canceled,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/in-progress`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Update Subscription to Finished', () => {
    it('should update a plan subscription to finished successfully when status is in progress', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.inProgress,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/finished`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return a not found status code when plan subscription to finished badly with invalid user id', async () => {
      const user = userFactory.build();
      const anotherId = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: anotherId.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.inProgress,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/finished`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return a not found status code when plan subscription to finished badly with invalid plan subscription id', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/finished`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return a bad request when plan subscription status is finished', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.completed,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/finished`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return a bad request when plan subscription status is completed', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.completed,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/finished`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return a bad request when plan subscription status is canceled', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.canceled,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/canceled`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Update Subscription to Canceled', () => {
    it('should update a plan subscription to canceled successfully when status is in progress', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.inProgress,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );
      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/canceled`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return a not found status code when plan subscription to canceled badly with invalid user id', async () => {
      const user = userFactory.build();
      const anotherId = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: anotherId.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.inProgress,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/canceled`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return a not found status code when plan subscription to canceled badly with invalid plan subscription id', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/canceled`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return a bad request when plan subscription status is canceled', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.notStarted,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/not-started`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return a bad request when plan subscription status is completed', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.completed,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/canceled`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return a bad request when plan subscription status is canceled', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.canceled,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/canceled`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Update Subscription to Not Started', () => {
    it('should update a plan subscription to canceled successfully when status is canceled', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.canceled,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/not-started`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return a bad request status code when plan subscription to canceled badly with invalid status', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.inProgress,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/not-started`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return a not found status code when plan subscription to canceled badly with invalid plan subscription id', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/not-started`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return a bad request when plan subscription status is not started', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.notStarted,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/not-started`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return a bad request when plan subscription status is completed', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.completed,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/not-started`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return a bad request when plan subscription status is in progress', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.inProgress,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const res = await fetch(
        `${url}/training-plan/${trainingPlan.id}/subscriptions/send/not-started`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Change Subscription Type', () => {
    it('should change subscription type successfully', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build();
      const planSubscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        status: PlanSubscriptionStatus.notStarted,
        type: PlanSubscriptionType.totalAccess,
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.PlanSubscription).insert(planSubscription);

      const res = await fetch(`${url}/training-plan/${trainingPlan.id}/subscriptions/privacy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({ type: PlanSubscriptionType.partialAccess }),
      });

      expect(res.status).toBe(HttpStatus.OK);

      const updatedSub = await testDbClient(Tables.PlanSubscription)
        .where({ id: planSubscription.id })
        .first();
      expect(updatedSub.type).toBe(PlanSubscriptionType.partialAccess);
    });

    it('should return bad request when there is already a private subscription', async () => {
      const user = userFactory.build();
      const trainingPlan1 = trainingPlanFactory.build();
      const trainingPlan2 = trainingPlanFactory.build();

      const sub1 = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan1.id,
        status: PlanSubscriptionStatus.inProgress,
        type: PlanSubscriptionType.private,
      });

      const sub2 = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: trainingPlan2.id,
        status: PlanSubscriptionStatus.notStarted,
        type: PlanSubscriptionType.totalAccess,
      });

      await testDbClient(Tables.TrainingPlan).insert([trainingPlan1, trainingPlan2]);
      await testDbClient(Tables.PlanSubscription).insert([sub1, sub2]);

      const res = await fetch(`${url}/training-plan/${trainingPlan2.id}/subscriptions/privacy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({ type: PlanSubscriptionType.partialAccess }),
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return not found when subscription does not exist', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build();

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      const res = await fetch(`${url}/training-plan/${trainingPlan.id}/subscriptions/privacy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({ type: PlanSubscriptionType.partialAccess }),
      });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return bad request for invalid type', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build();

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      const res = await fetch(`${url}/training-plan/${trainingPlan.id}/subscriptions/privacy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({ type: 'INVALID_TYPE' }),
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
