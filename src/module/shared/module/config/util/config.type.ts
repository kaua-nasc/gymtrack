import {
  configSchema,
  environmentSchema,
} from '@src/module/shared/module/config/util/config.schema';
import { z } from 'zod';

export type Environment = z.infer<typeof environmentSchema>;

export type Config = z.infer<typeof configSchema>;
