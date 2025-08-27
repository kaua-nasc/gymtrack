import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDayRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Nome do dia de treino',
    example: 'Dia de Pernas',
  })
  name: string;

  @IsUUID()
  @ApiProperty({
    description: 'ID do plano de treino ao qual o dia pertence',
    example: 'b4e6a2f4-9f8b-4c83-a7d9-ec72d83a2d43',
  })
  trainingPlanId: string;
}
