import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreatePlanDayProgressRequestSchema = z.object({
  planSubscriptionId: z.string().uuid().describe('ID da inscrição do plano'),
  dayId: z.string().uuid().describe('ID do dia concluído do treino'),
});

export class CreatePlanDayProgressRequestDto extends createZodDto(CreatePlanDayProgressRequestSchema) {}
