import { ApiProperty } from '@nestjs/swagger';

export class DayProgressResponseDto {
  @ApiProperty({
    description: 'ID da inscrição do plano',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
  })
  readonly planSubscriptionId: string;

  @ApiProperty({
    description: 'ID do dia associado ao progresso',
    example: 'f1e2d3c4-b5a6-7890-cdef-9876543210ab',
  })
  readonly dayId: string;
}
