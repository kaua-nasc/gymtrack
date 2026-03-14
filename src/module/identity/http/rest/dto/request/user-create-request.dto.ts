import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

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

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({ example: 'Ola, tudo bom?', description: 'Bio do usuário' })
  bio: string;

  @IsOptional()
  @IsEnum(UserType)
  @ApiProperty({
    enum: UserType,
    example: UserType.client,
    description: 'Tipo de usuário (CLIENT ou PERSONAL_TRAINER)',
    default: UserType.client,
  })
  type?: UserType;
}
