import { ApiProperty } from '@nestjs/swagger';

export class PlanSubscriptionExistsResponseDto {
  @ApiProperty({
    description: 'Indica se a inscrição no plano existe ou não',
    example: true,
  })
  readonly exists: boolean;
}
