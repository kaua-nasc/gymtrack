import { ApiProperty } from '@nestjs/swagger';

export class TrainingPlanExistsResponseDto {
  @ApiProperty({
    description: 'Indica se o plano de treino existe ou não',
    example: true,
  })
  readonly exists: boolean;
}
