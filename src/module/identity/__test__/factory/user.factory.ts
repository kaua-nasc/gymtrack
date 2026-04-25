import * as Factory from 'factory.ts';
import { User } from '../../persistence/entity/user.entity';
import { faker } from '@faker-js/faker';
import { hashPasswordSync } from '../../core/util/password.util';

export const userFactory = Factory.Sync.makeFactory<Partial<User>>({
  id: Factory.each(() => faker.string.uuid()),
  firstName: Factory.each(() => faker.person.firstName()),
  lastName: Factory.each(() => faker.person.lastName()),
  email: Factory.each(() => faker.internet.email()),
  password: hashPasswordSync('password123'),
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: undefined,
});

export const createUserFactory = Factory.Sync.makeFactory<Partial<User>>({
  firstName: Factory.each(() => faker.person.firstName()),
  lastName: Factory.each(() => faker.person.lastName()),
  email: Factory.each(() => faker.internet.email()),
  password: 'password123',
});
