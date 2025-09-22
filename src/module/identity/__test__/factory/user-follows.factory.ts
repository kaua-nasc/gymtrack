import * as Factory from 'factory.ts';
import { faker } from '@faker-js/faker';
import { UserFollows } from '../../persistence/entity/user-follows.entity';

export const userFollowsFactory = Factory.Sync.makeFactory<Partial<UserFollows>>({
  id: faker.string.uuid(),
  followerId: faker.string.uuid(),
  followingId: faker.string.uuid(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: undefined,
});
