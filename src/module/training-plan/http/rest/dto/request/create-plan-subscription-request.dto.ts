import { PlanSubscriptionType } from '@src/module/training-plan/core/enum/plan-subscription-type.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreatePlanSubscriptionRequestSchema = z.object({
  type: z
    .nativeEnum(PlanSubscriptionType)
    .describe('Tipo de inscricao (ex.: PRIVADA, PARTIAL_ACCESS, etc.)'),
});

export class CreatePlanSubscriptionRequestDto extends createZodDto(
  CreatePlanSubscriptionRequestSchema
) {}
