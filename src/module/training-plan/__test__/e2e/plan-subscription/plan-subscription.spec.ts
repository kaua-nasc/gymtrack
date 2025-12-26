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
import { HttpResponse, http } from 'msw';
import { SetupServerApi } from 'msw/node';
import { planSubscriptionFactory } from '../../factory/plan-subscription.factory';
import { trainingPlanFactory } from '../../factory/training-plan.factory';

describe('Plan Subscription - Plan Subscription Controller - (e2e)', () => {
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

      const res = await fetch(
        `${url}/training-plan/subscription/${trainingPlan.id}/${user.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'TOTAL_ACCESS' }),
        }
      );

      expect(res.status).toBe(HttpStatus.CREATED);
    });

    it('should return a not found status code when have not user with filled id', async () => {
      const trainingPlan = trainingPlanFactory.build({
        authorId: '00000000-0000-0000-0000-000000000001',
      });

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${trainingPlan.authorId}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const res = await fetch(
        `${url}/training-plan/subscription/${trainingPlan.id}/${trainingPlan.authorId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'TOTAL_ACCESS' }),
        }
      );

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

      const res = await fetch(
        `${url}/training-plan/subscription/${trainingPlan.id}/${trainingPlan.authorId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'TOTAL_ACCESS' }),
        }
      );

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

      const res = await fetch(
        `${url}/training-plan/subscription/${trainingPlan.id}/${user.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'TOTAL_ACCESS' }),
        }
      );

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

      const res = await fetch(
        `${url}/training-plan/subscription/${trainingPlan.id}/${user.id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );

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

      const res = await fetch(
        `${url}/training-plan/subscription/${trainingPlan.id}/${user.id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );

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

      const res = await fetch(
        `${url}/training-plan/subscription/${trainingPlan.id}/${user.id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      expect(res.status).toBe(HttpStatus.OK);
    });
    it('should return not found status code when delete a subscription with invalid user id', async () => {
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
          () => HttpResponse.json({ exists: false })
        )
      );

      const res = await fetch(
        `${url}/training-plan/subscription/${trainingPlan.id}/${user.id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const body = (await res.json()) as { message: string };

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(body.message).toBe('user not found');
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

      const res = await fetch(
        `${url}/training-plan/subscription/${trainingPlan.id}/${user.id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const body = (await res.json()) as { message: string };

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(body.message).toBe('subscription not found');
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

      const res = await fetch(
        `${url}/training-plan/subscription/${trainingPlan.id}/${user.id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const body = (await res.json()) as { message: string };

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(body.message).toBe(
        'Subscription status must be "not started" or "canceled"'
      );
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

      const res = await fetch(
        `${url}/training-plan/subscription/${trainingPlan.id}/${user.id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const body = (await res.json()) as { message: string };

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(body.message).toBe(
        'Subscription status must be "not started" or "canceled"'
      );
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
        `${url}/training-plan/subscription/send/in-progress/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return a not found status code when plan subscription to in progress badly with invalid user id', async () => {
      const user = userFactory.build({
        id: '00000000-0000-0000-0000-000000000001',
      });
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
          () => HttpResponse.json({ exists: false })
        )
      );

      const res = await fetch(
        `${url}/training-plan/subscription/send/in-progress/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/in-progress/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/in-progress/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/in-progress/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/in-progress/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/finished/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return a not found status code when plan subscription to finished badly with invalid user id', async () => {
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
        `${url}/training-plan/subscription/send/finished/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/finished/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/finished/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/finished/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/finished/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/canceled/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return a not found status code when plan subscription to canceled badly with invalid user id', async () => {
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
        `${url}/training-plan/subscription/send/canceled/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/canceled/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/canceled/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/canceled/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/canceled/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/not-started/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return a not found status code when plan subscription to canceled badly with invalid user id', async () => {
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
        `${url}/training-plan/subscription/send/not-started/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/not-started/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/not-started/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/not-started/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        `${url}/training-plan/subscription/send/not-started/${trainingPlan.id}/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
