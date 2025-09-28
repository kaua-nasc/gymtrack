import { IsNumber, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateTrainingPlanFeedbackRequestDto {
  @IsUUID()
  trainingPlanId: string;

  @IsUUID()
  userId: string;

  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 1 })
  @IsPositive({ always: true })
  rating: number;

  @IsString()
  message: string | undefined;
}
