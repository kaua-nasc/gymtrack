import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDayRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  trainingPlanId: string;
}
