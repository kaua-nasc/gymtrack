import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class ShareTrainingPlanRequestDto {
  @ApiProperty({
    description: 'Email do destinatário',
    example: 'amigo@exemplo.com',
  })
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @ApiProperty({
    description: 'ID do usuário destinatário (opcional)',
    example: '0d5f4e8d-9f9c-47a2-96c1-d3a02fcb0a50',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  recipientId?: string;
}
