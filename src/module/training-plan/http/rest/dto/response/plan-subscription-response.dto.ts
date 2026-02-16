import { ApiProperty } from '@nestjs/swagger';
import { TrainingPlan } from '@src/module/training-plan/persistence/entity/training-plan.entity';
import { TrainingPlanResponseDto } from './training-plan-response.dto';

export class PlanSubscriptionResponseDto {
  id: string;
  trainingPlanId: string;
  @ApiProperty({
    description: 'Status atual da assinatura',
    example: 'active',
  })
  status: string;

  @ApiProperty({
    description: 'Tipo da assinatura do plano',
    example: 'premium',
  })
  type: string;

  @ApiProperty({
    description: 'Informações do plano de treinamento associado à assinatura',
  })
  trainingPlan?: TrainingPlanResponseDto;
}
