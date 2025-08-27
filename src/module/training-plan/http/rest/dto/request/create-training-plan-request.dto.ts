import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TrainingPlanLevel } from '@src/module/training-plan/core/enum/training-plan-level.enum';
import { TrainingPlanType } from '@src/module/training-plan/core/enum/training-plan-type.enum';
import { TrainingPlanVisibility } from '@src/module/training-plan/core/enum/training-plan-visibility.enum';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTrainingPlanRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Nome do plano de treino',
    example: 'Plano de Hipertrofia Avançado',
  })
  readonly name: string;

  @IsUUID()
  @ApiProperty({
    description: 'ID do autor do plano',
    example: 'c1d2e3f4-5678-9876-5432-a1b2c3d4e5f6',
  })
  readonly authorId: string;

  @IsInt()
  @ApiProperty({
    description: 'Duração do plano em dias',
    example: 60,
  })
  readonly timeInDays: number;

  @IsEnum(TrainingPlanType)
  @ApiProperty({
    enum: TrainingPlanType,
    description: 'Tipo do plano (ex.: TREINAMENTO, AVALIACAO, etc.)',
    example: TrainingPlanType.hypertrophy,
  })
  readonly type: TrainingPlanType;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Observações adicionais sobre o plano',
    example: 'Indicado para pessoas com experiência prévia em academia',
  })
  readonly observation?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Patologia ou condição de saúde relacionada',
    example: 'Lombalgia crônica',
  })
  readonly pathology?: string;

  @IsEnum(TrainingPlanLevel)
  @ApiProperty({
    enum: TrainingPlanLevel,
    description: 'Nível do plano (ex.: INICIANTE, INTERMEDIARIO, AVANCADO)',
    example: TrainingPlanLevel.advanced,
  })
  readonly level: TrainingPlanLevel;

  @IsEnum(TrainingPlanVisibility)
  @ApiProperty({
    enum: TrainingPlanVisibility,
    description: 'Visibilidade do plano (PUBLICO ou PRIVADO)',
    example: TrainingPlanVisibility.public,
  })
  readonly visibility: TrainingPlanVisibility;
}
