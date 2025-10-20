import { IsOptional } from 'class-validator';

export class UserPrivacySettingsRequestDto {
  @IsOptional()
  shareName?: boolean;

  @IsOptional()
  shareEmail?: boolean;

  @IsOptional()
  shareTrainingProgress?: boolean;
}
