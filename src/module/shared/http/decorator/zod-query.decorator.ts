import { Query } from '@nestjs/common';
import { ZodType } from 'zod';
import { ZodValidationPipe } from '../pipe/zod-validation.pipe';

export const ZodQuery = <TOutput = unknown>(schema: ZodType<TOutput>) =>
  Query(new ZodValidationPipe(schema));
