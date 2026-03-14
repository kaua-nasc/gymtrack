import * as Factory from 'factory.ts';
import { User } from '../../persistence/entity/user.entity';
import { faker } from '@faker-js/faker';
import { hashSync } from 'bcrypt';
import { PASSWORD_HASH_SALT } from '../../core/service/user-management.service';

export const userFactory = Factory.Sync.makeFactory<Partial<User>>({
  id: Factory.each(() => faker.string.uuid()),
  firstName: Factory.each(() => faker.person.firstName()),
  lastName: Factory.each(() => faker.person.lastName()),
  email: Factory.each(() => faker.internet.email()),
  password: hashSync('password123', PASSWORD_HASH_SALT),
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
