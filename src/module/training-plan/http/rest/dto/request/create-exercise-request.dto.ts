import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateExerciseRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Nome do exercício',
    example: 'Agachamento Livre',
  })
  name: string;

  @IsUUID()
  @ApiProperty({
    description: 'ID do dia ao qual o exercício pertence',
    example: '5b3b6b30-3f6d-4a15-a5db-2a7b9d6b1e71',
  })
  dayId: string;

  @IsEnum(ExerciseType)
  @ApiProperty({
    description: 'Tipo do exercício',
    enum: ExerciseType,
    example: ExerciseType.cardio,
  })
  type: ExerciseType;

  @IsInt()
  @ApiProperty({
    description: 'Número de séries do exercício',
    example: 4,
  })
  setsNumber: number;

  @IsInt()
  @ApiProperty({
    description: 'Número de repetições por série',
    example: 12,
  })
  repsNumber: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'Descrição do exercício',
    example: 'Manter a coluna ereta durante todo o movimento',
  })
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'Observações adicionais',
    example: 'Aumentar carga progressivamente a cada semana',
  })
  observation?: string;
}
