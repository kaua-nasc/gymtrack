import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LinkTrainerRequestDto {
  @ApiProperty({ example: 'TEAM-SILVA-2026', description: 'Código de convite do treinador' })
  @IsString()
  @IsNotEmpty()
  inviteCode: string;
}
