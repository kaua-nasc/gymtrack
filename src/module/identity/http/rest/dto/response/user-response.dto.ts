import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '@src/module/identity/core/enum/user-type.enum';

export class UserResponseDto {
  @ApiProperty({
    description: 'Identificador único do usuário',
    example: 'e7f3c2d1-4f9a-4b6c-9b2a-5c1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({ description: 'Primeiro nome do usuário', example: 'João' })
  firstName: string;

  @ApiProperty({ description: 'Sobrenome do usuário', example: 'Silva' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Bio do usuário',
    example: 'Apaixonado por fitness',
  })
  bio?: string;

  @ApiPropertyOptional({ description: 'URL da foto de perfil' })
  profilePictureUrl?: string;

  @ApiProperty({ enum: UserType, description: 'Tipo de usuário' })
  type: UserType;

  @ApiPropertyOptional({
    description: 'Registro Profissional (CREF)',
    example: '123456-G/SP',
  })
  cref?: string;

  @ApiProperty({ description: 'Indica se o perfil é verificado', default: false })
  isVerified: boolean;

  @ApiPropertyOptional({
    description: 'Código de convite do treinador',
    example: 'TEAM-SILVA-2026',
  })
  trainerInviteCode?: string;

  @ApiPropertyOptional({
    description: 'Indica se o usuário logado segue este usuário',
    example: true,
  })
  isFollowing?: boolean;
}
