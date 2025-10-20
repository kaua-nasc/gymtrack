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
    cache: {
      host: process.env.CACHE_HOST,
      port: Number(process.env.CACHE_PORT),
      db: Number(process.env.CACHE_DB),
      password: process.env.CACHE_PASSWORD,
    },
    email: {
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PASS,
      },
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
