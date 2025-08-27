import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserCreateRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'joao.silva@email.com', description: 'Email do usuário' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'senha123', description: 'Senha do usuário' })
  password: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'João', description: 'Primeiro nome do usuário' })
  firstName: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Silva', description: 'Sobrenome do usuário' })
  lastName: string;
}
