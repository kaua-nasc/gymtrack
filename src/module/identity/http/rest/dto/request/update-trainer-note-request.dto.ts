import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTrainerNoteRequestDto {
  @ApiProperty({ example: 'Ótima evolução de massa magra!' })
  @IsString()
  @IsNotEmpty()
  readonly note: string;
}
