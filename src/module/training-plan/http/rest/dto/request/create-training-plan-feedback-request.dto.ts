import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateTrainingPlanFeedbackRequestDto {
  @IsUUID()
  @ApiProperty({
    example: 'c4b65c51-89a3-4f32-93e2-8a9f78b26c71',
    description: 'ID do plano de treino que receberá o feedback',
  })
  trainingPlanId: string;

  @IsUUID()
  @ApiProperty({
    example: '0d5f4e8d-9f9c-47a2-96c1-d3a02fcb0a50',
    description: 'ID do usuário que está enviando o feedback',
  })
  userId: string;

  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 1 })
  @IsPositive({ always: true })
  @ApiProperty({
    example: 4.5,
    description: 'Nota do plano de treino de 0 a 5',
  })
  rating: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Plano excelente, bem estruturado e progressivo!',
    description: 'Comentário adicional do usuário (opcional)',
  })
  message: string | null;
}
