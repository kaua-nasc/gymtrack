import { faker } from '@faker-js/faker';
import * as Factory from 'factory.ts';
import { UserType } from '../../core/enum/user-type.enum';
import { hashPasswordSync } from '../../core/util/password.util';
import type { User } from '../../persistence/entity/user.entity';

export const userFactory = Factory.Sync.makeFactory<Partial<User>>({
  id: Factory.each(() => faker.string.uuid()),
  firstName: Factory.each(() => faker.person.firstName()),
  lastName: Factory.each(() => faker.person.lastName()),
  email: Factory.each(() => faker.internet.email()),
  password: hashPasswordSync('password123'),
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: undefined,
  type: Factory.each(() =>
    faker.helpers.arrayElement([UserType.client, UserType.personalTrainer])
  ),
  isVerified: false,
});

export const createUserFactory = Factory.Sync.makeFactory<Partial<User>>({
  firstName: Factory.each(() => faker.person.firstName()),
  lastName: Factory.each(() => faker.person.lastName()),
  email: Factory.each(() => faker.internet.email()),
  password: 'password123',
  type: UserType.client,
});
