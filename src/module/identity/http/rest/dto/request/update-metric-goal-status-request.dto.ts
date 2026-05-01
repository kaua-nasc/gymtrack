import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { MetricGoalStatus } from '../../../../core/enum/metric-goal-status.enum';

export const UpdateMetricGoalStatusRequestSchema = z.object({
  status: z.enum(MetricGoalStatus).describe('Status do objetivo métrico'),
});

export class UpdateMetricGoalStatusRequestDto extends createZodDto(
  UpdateMetricGoalStatusRequestSchema
) {}
