import { config } from 'dotenv';
import fs from 'fs';

const testEnvFile = `.env.test`;
const envFile = `.env`;

if (!fs.existsSync(envFile)) {
  throw new Error('.env file not found');
}

// Ensure a test environment variable file exists because of the override config
// loading mechanics below.
if (!fs.existsSync(testEnvFile)) {
  throw new Error('.env.test file found');
}

// We don't want to have two dotenv files that are exactly the same, so we
// override the default with .env.test.
//
// If a .env.test file is not found, the DATABASE_URL will fallback to the
// default. Consequently, you'll lose your development database during the
// integration tests teardown. Hence, the check above.
config({ path: envFile });
config({ path: testEnvFile, override: true });

export const getTestConfig = (): { [key: string]: string | number | undefined } => ({
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  'database.url': process.env.DATABASE_URL,
  'cache.host': process.env.CACHE_HOST,
  'cache.port': Number(process.env.CACHE_PORT),
  'cache.db': Number(process.env.CACHE_DB),
  'cache.password': process.env.CACHE_PASSWORD,
  'email.host': process.env.EMAIL_HOST,
  'email.port': Number(process.env.EMAIL_PORT),
  'email.service': process.env.EMAIL_SERVICE,
  'email.auth.user': process.env.EMAIL_AUTH_USER,
  'email.auth.pass': process.env.EMAIL_AUTH_PASS,
  'storage.aws.endpoint': process.env.AWS_STORAGE_ENDPOINT,
  'storage.aws.port': Number(process.env.AWS_STORAGE_PORT),
  'storage.aws.accessKey': process.env.AWS_STORAGE_ACCESS_KEY,
  'storage.aws.secretKey': process.env.AWS_STORAGE_SECRET_KEY,
  'storage.aws.region': process.env.AWS_STORAGE_REGION,
  'storage.aws.bucket': process.env.AWS_STORAGE_BUCKET,
  'storage.azure.container': process.env.AZURE_STORAGE_CONTAINER,
  'storage.azure.account': process.env.AZURE_STORAGE_ACCOUNT, // Corrigido 'Storage' para 'storage'
  'storage.azure.connectionString': process.env.AZURE_STORAGE_CONNECTION_STRING,
  'storage.azure.url': process.env.AZURE_STORAGE_URL,
  'billingApi.url': process.env.BILLING_API_URL,
  'identityApi.url': 'http://localhost:9876',
  'trainingPlanApi.url': 'http://aguardando-inicializacao',
});
