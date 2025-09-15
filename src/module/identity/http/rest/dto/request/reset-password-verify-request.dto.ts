import { ApiProperty } from '@nestjs/swagger';
import { IsByteLength, IsEmail, IsString } from 'class-validator';

export class ResetPasswordVerifyDto {
  @IsString()
  @IsByteLength(4, 4)
  @ApiProperty({
    example: '1234',
    description: 'Codigo gerado ao requerir a redefinicao da senha',
  })
  token: string;

  @IsEmail()
  @ApiProperty({ example: 'joao.silva@email.com', description: 'Email do usuário' })
  email: string;
}
