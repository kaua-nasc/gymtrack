import { ApiProperty } from '@nestjs/swagger';
import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';

export class ExerciseResponseDto {
  @ApiProperty({
    description: 'ID do exercício',
    example: 'c3d2b1a4-e5f6-7890-abcd-1234567890ef',
  })
  readonly id: string;

  @ApiProperty({
    description: 'Nome do exercício',
    example: 'Supino reto',
  })
  readonly name: string;

  @ApiProperty({
    description: 'Tipo do exercício',
    enum: ExerciseType,
    example: ExerciseType.cardio,
  })
  readonly type: ExerciseType;

  @ApiProperty({
    description: 'Número de séries',
    example: 4,
  })
  readonly setsNumber: number;

  @ApiProperty({
    description: 'Número de repetições',
    example: 12,
  })
  readonly repsNumber: number;

  @ApiProperty({
    description: 'Descrição opcional do exercício',
    example: 'Executar com carga moderada e controle total do movimento',
    required: false,
  })
  readonly description?: string;

  @ApiProperty({
    description: 'Observações adicionais',
    example: 'Evitar hiperextensão lombar durante a execução',
    required: false,
  })
  readonly observation?: string;
}
