import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTrainingPlanFeedbackRequestSchema = z.object({
  trainingPlanId: z
    .uuid()
    .describe('ID do plano de treino que receberá o feedback'),
  userId: z.uuid().describe('ID do usuário que está enviando o feedback'),
  rating: z.number().min(0).max(5).describe('Nota do plano de treino de 0 a 5'),
  message: z
    .string()
    .min(1)
    .nullable()
    .optional()
    .describe('Comentário adicional do usuário (opcional)'),
});

export class CreateTrainingPlanFeedbackRequestDto extends createZodDto(
  CreateTrainingPlanFeedbackRequestSchema
) {}
