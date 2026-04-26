import { Param } from '@nestjs/common';
import { ZodType } from 'zod';
import { ZodValidationPipe } from '../pipe/zod-validation.pipe';

export const ZodParam = <TOutput = unknown>(schema: ZodType<TOutput>) =>
  Param(new ZodValidationPipe(schema));
