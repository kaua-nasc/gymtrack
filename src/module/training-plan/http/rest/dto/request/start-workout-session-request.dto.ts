import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const StartWorkoutSessionRequestSchema = z.object({
  dayId: z.uuid().describe('ID do dia de treino'),
});

export class StartWorkoutSessionRequestDto extends createZodDto(
  StartWorkoutSessionRequestSchema
) {}
