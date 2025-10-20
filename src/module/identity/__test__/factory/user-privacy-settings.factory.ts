import * as Factory from 'factory.ts';
import { faker } from '@faker-js/faker';
import { UserPrivacySettings } from '../../persistence/entity/user-privacy-settings.entity';

export const userPrivacySettingsFactory = Factory.Sync.makeFactory<
  Partial<UserPrivacySettings>
>({
  id: faker.string.uuid(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: undefined,
  shareEmail: faker.datatype.boolean(),
  shareName: faker.datatype.boolean(),
  shareTrainingProgress: faker.datatype.boolean(),
});
