import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

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
}
