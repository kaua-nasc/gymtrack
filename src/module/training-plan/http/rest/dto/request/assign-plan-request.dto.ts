import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { PlanSubscriptionType } from '../../../../core/enum/plan-subscription-type.enum';

export class AssignPlanRequestDto {
  @ApiProperty({ description: 'ID do aluno (estudante)', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'ID do plano de treino', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: 'Tipo da assinatura do plano',
    enum: PlanSubscriptionType,
    example: PlanSubscriptionType.private,
  })
  @IsEnum(PlanSubscriptionType)
  @IsNotEmpty()
  type: PlanSubscriptionType;
}
