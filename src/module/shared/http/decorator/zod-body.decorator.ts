import { Body } from '@nestjs/common';
import { ZodType } from 'zod';
import { ZodValidationPipe } from '../pipe/zod-validation.pipe';

export const ZodBody = <TOutput = unknown>(schema: ZodType<TOutput>) =>
  Body(new ZodValidationPipe(schema));
