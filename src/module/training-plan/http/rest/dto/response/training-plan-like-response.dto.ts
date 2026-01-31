import { ApiProperty } from '@nestjs/swagger';

export class TrainingPlanLikeResponseDto {
  @ApiProperty({
    description: 'ID do like',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  id: string;

  @ApiProperty({
    description: 'Data de criação do like',
    example: '2026-01-31T15:36:34.016Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização do like',
    example: '2026-01-31T18:36:33.928Z',
  })
  updatedAt?: Date | null | undefined;
}
