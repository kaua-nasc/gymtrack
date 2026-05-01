import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTrainingPlanProgressRequestSchema = z.object({
  userId: z.uuid().describe('ID do usuário que iniciou o progresso do plano'),
  trainingPlanId: z.uuid().describe('ID do plano de treino associado'),
});

export class CreateTrainingPlanProgressRequestDto extends createZodDto(
  CreateTrainingPlanProgressRequestSchema
) {}
