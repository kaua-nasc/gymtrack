import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Identificador único do usuário',
    example: 'e7f3c2d1-4f9a-4b6c-9b2a-5c1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'user@example.com',
  })
  email: string;
}
