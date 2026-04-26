import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateExerciseSchema = z.object({
  name: z.string().min(1).describe('Nome do exercício'),
  type: z.nativeEnum(ExerciseType).describe('Tipo do exercício'),
  setsNumber: z.number().int().describe('Número de séries'),
  repsNumber: z.number().int().describe('Número de repetições por série'),
  description: z.string().min(1).optional().describe('Descrição do exercício'),
  observation: z.string().min(1).optional().describe('Observações do exercício'),
});

export const CreateManyDayRequestSchema = z.object({
  name: z.string().min(1).describe('Nome do dia de treino'),
  trainingPlanId: z.string().uuid().describe('ID do plano de treino relacionado'),
  exercises: z.array(CreateExerciseSchema).describe('Lista de exercícios do dia'),
});

export class CreateManyDayRequestDto extends createZodDto(CreateManyDayRequestSchema) {}
