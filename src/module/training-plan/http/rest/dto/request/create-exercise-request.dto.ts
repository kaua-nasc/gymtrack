import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';

export const CreateExerciseRequestSchema = z.object({
  name: z.string().min(1).describe('Nome do exercício'),
  dayId: z.string().uuid().describe('ID do dia ao qual o exercício pertence'),
  type: z.nativeEnum(ExerciseType).describe('Tipo do exercício'),
  setsNumber: z.number().int().describe('Número de séries do exercício'),
  repsNumber: z.number().int().describe('Número de repetições por série'),
  description: z.string().min(1).optional().describe('Descrição do exercício'),
  observation: z.string().min(1).optional().describe('Observações adicionais'),
});

export class CreateExerciseRequestDto extends createZodDto(CreateExerciseRequestSchema) {}
