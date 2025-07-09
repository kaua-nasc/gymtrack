import * as Factory from 'factory.ts';
import { User } from '../../persistence/entity/user.entity';
import { faker } from '@faker-js/faker/.';
import { hashSync } from 'bcrypt';
import { PASSWORD_HASH_SALT } from '../../core/service/user-management.service';

export const userFactory = Factory.Sync.makeFactory<Partial<User>>({
  id: faker.string.uuid(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  password: hashSync('password123', PASSWORD_HASH_SALT),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: undefined,
});
