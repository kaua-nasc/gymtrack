import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { WeightUnit } from '../../../../core/enum/weight-unit.enum';
import { HeightUnit } from '../../../../core/enum/height-unit.enum';

export const UpdateUserMetricsRequestSchema = z.object({
  height: z.number().min(0).optional().describe('User height'),
  currentWeight: z.number().min(0).optional().describe('User current weight'),
  weightUnit: z.nativeEnum(WeightUnit).optional().describe('Unidade de peso'),
  heightUnit: z.nativeEnum(HeightUnit).optional().describe('Unidade de altura'),
});

export class UpdateUserMetricsRequestDto extends createZodDto(UpdateUserMetricsRequestSchema) {}
