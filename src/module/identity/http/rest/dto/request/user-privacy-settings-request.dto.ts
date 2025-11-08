import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UserPrivacySettingsRequestDto {
  @ApiPropertyOptional({
    description: 'Indica se o nome do usuário pode ser exibido publicamente',
    example: true,
  })
  @IsOptional()
  shareName?: boolean;

  @ApiPropertyOptional({
    description: 'Indica se o e-mail do usuário pode ser compartilhado',
    example: false,
  })
  @IsOptional()
  shareEmail?: boolean;

  @ApiPropertyOptional({
    description: 'Indica se o progresso de treino pode ser compartilhado',
    example: true,
  })
  @IsOptional()
  shareTrainingProgress?: boolean;
}
