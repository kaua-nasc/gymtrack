import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UserChangeBioRequestDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'João', description: 'Primeiro nome do usuário' })
  firstName: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Silva', description: 'Sobrenome do usuário' })
  lastName: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Bio aleatoria', description: 'Bio do usuário' })
  bio: string;

  @ApiPropertyOptional({ example: '123456-G/SP', description: 'Registro Profissional (CREF)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cref?: string;
}
