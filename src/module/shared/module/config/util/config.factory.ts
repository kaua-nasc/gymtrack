import { ConfigException } from '@src/module/shared/module/config/exception/config.exception';
import { configSchema } from './config.schema';
import { Config } from './config.type';

export const factory = (): Config => {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    database: {
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      port: process.env.DATABASE_PORT,
      url: process.env.DATABASE_URL,
      username: process.env.DATABASE_USERNAME,
    },
    movieDb: {
      apiToken: process.env.MOVIEDB_API_TOKEN,
      url: process.env.MOVIEDB_BASE_URL,
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
