import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID } from 'class-validator';

export class UserGetByIdsRequestDto {
  @ApiProperty({
    description: 'Lista de IDs dos usuários',
    example: ['a8216f60-34b3-4b6e-91e0-1a9d93b1a924'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsUUID('7', { each: true })
  userIds: string[];
}
