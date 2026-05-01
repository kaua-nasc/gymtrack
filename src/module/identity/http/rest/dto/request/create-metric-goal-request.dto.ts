import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateMetricGoalRequestSchema = z.object({
  type: z.string().min(1).describe('Can be WEIGHT or any MeasurementType'),
  targetValue: z.number().min(0).describe('The target value to reach'),
  deadline: z.iso.datetime().optional().describe('2026-06-01T00:00:00Z'),
});

export class CreateMetricGoalRequestDto extends createZodDto(
  CreateMetricGoalRequestSchema
) {}
