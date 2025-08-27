import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateTrainingPlanProgressRequestDto {
  @IsUUID()
  @ApiProperty({
    description: 'ID do usuário que iniciou o progresso do plano',
    example: 'a3f6c27e-81e4-4d99-89b4-08fd5d2b63b1',
  })
  readonly userId: string;

  @IsUUID()
  @ApiProperty({
    description: 'ID do plano de treino associado',
    example: 'b1f8d4e2-2c41-45e6-9a6b-92f7f7a3e123',
  })
  readonly trainingPlanId: string;
}
