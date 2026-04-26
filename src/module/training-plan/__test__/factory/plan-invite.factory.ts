import { faker } from '@faker-js/faker';
import * as Factory from 'factory.ts';
import { PlanInviteStatus } from '../../core/enum/plan-invite-status.enum';
import type { PlanInvite } from '../../persistence/entity/plan-invite.entity';

export const planInviteFactory = Factory.Sync.makeFactory<Partial<PlanInvite>>({
  id: faker.string.uuid(),
  planId: faker.string.uuid(),
  senderId: faker.string.uuid(),
  recipientEmail: faker.internet.email(),
  recipientId: null,
  status: PlanInviteStatus.PENDING,
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});
