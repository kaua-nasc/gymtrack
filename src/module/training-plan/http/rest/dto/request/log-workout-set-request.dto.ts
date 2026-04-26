import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LogWorkoutSetRequestSchema = z.object({
  exerciseId: z.string().uuid().describe('ID do exercício'),
  reps: z.number().int().min(1).describe('Número de repetições'),
  weight: z.number().min(0).describe('Peso utilizado'),
  rpe: z.number().int().min(1).max(10).optional().describe('Esforço percebido (1-10)'),
});

export class LogWorkoutSetRequestDto extends createZodDto(LogWorkoutSetRequestSchema) {}
