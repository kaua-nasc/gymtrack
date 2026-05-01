import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateDayRequestSchema = z.object({
  name: z.string().min(1).describe('Nome do dia de treino'),
  trainingPlanId: z.uuid().describe('ID do plano de treino ao qual o dia pertence'),
});

export class CreateDayRequestDto extends createZodDto(CreateDayRequestSchema) {}
