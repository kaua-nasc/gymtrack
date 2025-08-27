import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateManyDayRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Nome do dia de treino', example: 'Dia de Peito' })
  name: string;

  @IsUUID()
  @ApiProperty({ description: 'ID do plano de treino relacionado', example: 'uuid-v4' })
  trainingPlanId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExercise)
  @ApiProperty({
    type: () => [CreateExercise],
    description: 'Lista de exercícios do dia',
  })
  exercises: CreateExercise[];
}

class CreateExercise {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Nome do exercício', example: 'Supino reto' })
  name: string;

  @IsEnum(ExerciseType)
  @ApiProperty({ enum: ExerciseType, description: 'Tipo do exercício' })
  type: ExerciseType;

  @IsInt()
  @ApiProperty({ description: 'Número de séries', example: 4 })
  setsNumber: number;

  @IsInt()
  @ApiProperty({ description: 'Número de repetições por série', example: 12 })
  repsNumber: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Descrição do exercício',
    example: 'Executar com barra',
    required: false,
  })
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Observações do exercício',
    example: 'Manter postura correta',
    required: false,
  })
  observation?: string;
}
