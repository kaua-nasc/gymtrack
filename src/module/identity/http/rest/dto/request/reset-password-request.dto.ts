import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResetPasswordRequestDto {
  @IsEmail()
  @ApiProperty({ example: 'joao.silva@email.com', description: 'Email do usuário' })
  email: string;
}
