import { ApiProperty } from '@nestjs/swagger';
import { IsByteLength, IsString, IsUUID } from 'class-validator';

export class ResetPasswordNewPasswordRequestDto {
  @IsUUID()
  @ApiProperty({
    example: 'b9304ce1-e8ab-47d8-b1c2-4c756b5d2d0e',
    description: 'id do usuario',
  })
  userId: string;

  @IsString()
  @IsByteLength(8, 255)
  @ApiProperty({ example: 'qW@!soad', description: 'Nova senha criada' })
  newPassword: string;
}
