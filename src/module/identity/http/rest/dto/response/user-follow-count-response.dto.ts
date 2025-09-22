import { ApiProperty } from '@nestjs/swagger';

export class UserFollowCountResponseDto {
  @ApiProperty({
    description: 'Contagem de seguidores/seguindo',
    example: 10,
  })
  count: number;
}
