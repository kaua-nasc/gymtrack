import { ApiProperty } from '@nestjs/swagger';

export class UserExistsResponseDto {
  @ApiProperty({
    description: 'Indica se o usuário existe no sistema',
    example: true,
  })
  exists: boolean;
}
