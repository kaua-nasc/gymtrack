import { ApiProperty } from '@nestjs/swagger';

export class SignInResponseDto {
  @ApiProperty({ example: 'token.jwt.aqui', description: 'JWT do usuário autenticado' })
  accessToken: string;
}
