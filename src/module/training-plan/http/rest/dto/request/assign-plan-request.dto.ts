import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PlanSubscriptionType } from '../../../../core/enum/plan-subscription-type.enum';

export const AssignPlanRequestSchema = z.object({
  studentId: z.string().uuid().describe('ID do aluno (estudante)'),
  planId: z.string().uuid().describe('ID do plano de treino'),
  type: z.nativeEnum(PlanSubscriptionType).describe('Tipo da assinatura do plano'),
});

export class AssignPlanRequestDto extends createZodDto(AssignPlanRequestSchema) {}
