import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreatePlanDayProgressRequestDto {
  @IsUUID()
  @ApiProperty({
    description: 'ID da inscrição do plano',
    example: 'c1a8d0e7-5f33-4d0f-8d21-0c9d3d4b9a1f',
  })
  readonly planSubscriptionId: string;

  @IsUUID()
  @ApiProperty({
    description: 'ID do dia concluído do treino',
    example: '5e4b3a2c-8f11-4d91-9a42-2e7f2b8a3c21',
  })
  readonly dayId: string;
}
