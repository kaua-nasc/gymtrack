import { z } from 'zod';

export const environmentSchema = z.enum(['test', 'development', 'production']);

export const databaseSchema = z.object({
  url: z.string().startsWith('postgresql://'),
});

export const cacheSchema = z.object({
  host: z.string(),
  port: z.number().positive().int(),
  db: z.number().int(),
  password: z.string(),
});

export const emailAuthSchema = z.object({
  user: z.email(),
  pass: z.string(),
});

export const emailSchema = z.object({
  host: z.string(),
  port: z.int(),
  service: z.string(),
  auth: emailAuthSchema,
});

export const trainingPlanApiSchema = z.object({
  url: z.string(),
});

const billingApiSchema = z.object({
  url: z.string(),
});

const identityApiSchema = z.object({
  url: z.string(),
});

export const configSchema = z.object({
  env: environmentSchema,
  port: z.coerce.number().positive().int(),
  database: databaseSchema,
  email: emailSchema,
  cache: cacheSchema,
  trainingPlanApi: trainingPlanApiSchema,
  billingApi: billingApiSchema,
  identityApi: identityApiSchema,
});
