import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpgradeToPersonalTrainerRequestDto {
  @ApiProperty({ example: '123456-G/SP', description: 'Registro Profissional (CREF)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(20)
  cref: string;
}
