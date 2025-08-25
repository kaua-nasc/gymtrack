import { ApiProperty } from '@nestjs/swagger';
import { TrainingPlanLevel } from '@src/module/training-plan/core/enum/training-plan-level.enum';
import { TrainingPlanType } from '@src/module/training-plan/core/enum/training-plan-type.enum';
import { TrainingPlanVisibility } from '@src/module/training-plan/core/enum/training-plan-visibility.enum';

export class TrainingPlanResponseDto {
  @ApiProperty({
    description: 'Nome do plano de treino',
    example: 'Plano de Hipertrofia - 12 semanas',
  })
  name: string;

  @ApiProperty({
    description: 'ID do autor do plano',
    example: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
  })
  authorId: string;

  @ApiProperty({
    description: 'Duração do plano em dias',
    example: 84,
  })
  timeInDays: number;

  @ApiProperty({
    description: 'Tipo do plano de treino',
    enum: TrainingPlanType,
    example: TrainingPlanType.hypertrophy,
  })
  type: TrainingPlanType;

  @ApiProperty({
    description: 'Observações adicionais sobre o plano',
    example: 'Indicado para praticantes intermediários.',
    required: false,
  })
  observation?: string;

  @ApiProperty({
    description: 'Patologias a serem consideradas no plano',
    example: 'Lesão no ombro',
    required: false,
  })
  pathology?: string;

  @ApiProperty({
    description: 'Visibilidade do plano',
    enum: TrainingPlanVisibility,
    example: TrainingPlanVisibility.public,
  })
  visibility: TrainingPlanVisibility;

  @ApiProperty({
    description: 'Nível do plano de treino',
    enum: TrainingPlanLevel,
    example: TrainingPlanLevel.beginner,
  })
  level: TrainingPlanLevel;

  @ApiProperty({
    description: 'Número máximo de inscrições permitidas',
    example: 100,
    required: false,
  })
  maxSubscriptions?: number;
}
