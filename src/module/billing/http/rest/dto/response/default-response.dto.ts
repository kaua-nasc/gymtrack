import { Expose } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export abstract class DefaultResponseDto {
  @IsUUID(4)
  @IsNotEmpty()
  @Expose()
  readonly id: string;

  @IsDateString()
  @Expose()
  readonly createdAt: Date;

  @IsDateString()
  @Expose()
  readonly updatedAt: Date;

  @IsDateString()
  @Expose()
  @IsOptional()
  readonly deletedAt: Date | null;
}
