import { ApiProperty } from '@nestjs/swagger';
import { PlanSubscriptionType } from '@src/module/training-plan/core/enum/plan-subscription-type.enum';
import { IsEnum } from 'class-validator';

export class CreatePlanSubscriptionRequestDto {
  @IsEnum(PlanSubscriptionType)
  @ApiProperty({
    enum: PlanSubscriptionType,
    description: 'Tipo de inscricao (ex.: PRIVADA, PARTIAL_ACCESS, etc.)',
    example: PlanSubscriptionType.private,
  })
  type: PlanSubscriptionType;
}
