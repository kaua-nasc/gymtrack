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
    storage: {
      aws: {
        endpoint: process.env.AWS_STORAGE_ENDPOINT,
        port: Number(process.env.AWS_STORAGE_PORT),
        accessKey: process.env.AWS_STORAGE_ACCESS_KEY,
        secretKey: process.env.AWS_STORAGE_SECRET_KEY,
        region: process.env.AWS_STORAGE_REGION,
        bucket: process.env.AWS_STORAGE_BUCKET,
      },
      azure: {
        container: process.env.AZURE_STORAGE_CONTAINER,
        account: process.env.AZURE_STORAGE_ACCOUNT,
        connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
        url: process.env.AZURE_STORAGE_URL,
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
