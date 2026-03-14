import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateTrainerInviteCodeRequestDto {
  @ApiProperty({ example: 'TEAM-SILVA-2026', description: 'Código de convite personalizado' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  inviteCode: string;
}
