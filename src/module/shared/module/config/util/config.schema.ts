import { z } from 'zod';

export const environmentSchema = z.enum(['test', 'development', 'production']);

export const databaseSchema = z.object({
  url: z.string().startsWith('postgresql://'),
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
  trainingPlanApi: trainingPlanApiSchema,
  billingApi: billingApiSchema,
  identityApi: identityApiSchema,
});
