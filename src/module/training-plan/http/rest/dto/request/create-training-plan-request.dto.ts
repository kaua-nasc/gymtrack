import { TrainingPlanLevel } from '@src/module/training-plan/core/enum/training-plan-level.enum';
import { TrainingPlanType } from '@src/module/training-plan/core/enum/training-plan-type.enum';
import { TrainingPlanVisibility } from '@src/module/training-plan/core/enum/training-plan-visibility.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTrainingPlanRequestSchema = z.object({
  name: z.string().min(1).describe('Nome do plano de treino'),
  authorId: z.uuid().describe('ID do autor do plano'),
  timeInDays: z.number().int().describe('Duração do plano em dias'),
  type: z
    .enum(TrainingPlanType)
    .describe('Tipo do plano (ex.: TREINAMENTO, AVALIACAO, etc.)'),
  observation: z
    .string()
    .min(1)
    .optional()
    .describe('Observações adicionais sobre o plano'),
  pathology: z
    .string()
    .min(1)
    .optional()
    .describe('Patologia ou condição de saúde relacionada'),
  level: z
    .enum(TrainingPlanLevel)
    .describe('Nível do plano (ex.: INICIANTE, INTERMEDIARIO, AVANCADO)'),
  visibility: z
    .enum(TrainingPlanVisibility)
    .describe('Visibilidade do plano (PUBLICO ou PRIVADO)'),
  description: z.string().min(1).optional().describe('Descricao do plano'),
});

export class CreateTrainingPlanRequestDto extends createZodDto(
  CreateTrainingPlanRequestSchema
) {}
