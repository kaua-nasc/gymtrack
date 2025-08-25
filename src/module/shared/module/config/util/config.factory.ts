import { ConfigException } from '@src/module/shared/module/config/exception/config.exception';
import { configSchema } from './config.schema';
import { Config } from './config.type';

export const factory = (): Config => {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    database: {
      url: process.env.DATABASE_URL,
    },
    trainingPlanApi: {
      url: process.env.TRAINING_PLAN_API,
    },
    billingApi: {
      url: process.env.BILLING_API_URL,
    },
    identityApi: {
      url: process.env.IDENTITY_API,
    },
  });

  if (result.success) {
    return result.data;
  }

  throw new ConfigException(`Invalid application configuration: ${result.error.message}`);
};
