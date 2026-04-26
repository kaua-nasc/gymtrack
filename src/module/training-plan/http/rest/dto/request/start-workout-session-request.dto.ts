import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const StartWorkoutSessionRequestSchema = z.object({
  dayId: z.string().uuid().describe('ID do dia de treino'),
});

export class StartWorkoutSessionRequestDto extends createZodDto(StartWorkoutSessionRequestSchema) {}
