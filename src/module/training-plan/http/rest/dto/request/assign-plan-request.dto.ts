import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PlanSubscriptionType } from '../../../../core/enum/plan-subscription-type.enum';

export const AssignPlanRequestSchema = z.object({
  studentId: z.uuid().describe('ID do aluno (estudante)'),
  planId: z.uuid().describe('ID do plano de treino'),
  type: z.enum(PlanSubscriptionType).describe('Tipo da assinatura do plano'),
});

export class AssignPlanRequestDto extends createZodDto(AssignPlanRequestSchema) {}
