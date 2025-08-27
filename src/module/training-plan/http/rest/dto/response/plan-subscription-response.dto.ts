import { ApiProperty } from '@nestjs/swagger';

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
}
