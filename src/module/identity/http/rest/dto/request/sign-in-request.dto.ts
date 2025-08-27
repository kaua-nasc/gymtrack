import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'joao.silva@email.com', description: 'Email do usuário' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'senha123', description: 'Senha do usuário' })
  password: string;
}
