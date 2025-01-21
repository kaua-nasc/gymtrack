import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';
import { ExerciseManagementService } from '@src/module/training-plan/core/service/exercise-management.service';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseManagementService: ExerciseManagementService) {}

  @Post()
  async createTraining(@Body() contentData: Input): Promise<Output> {
    const createTraining = await this.exerciseManagementService.createExercise({
      ...contentData,
    });

    return {
      id: createTraining.id,
    };
  }

  @Get('list/:trainingId')
  async getTrainingsByDayId(@Param('trainingId') trainingId: string) {
    const traningPlans = await this.exerciseManagementService.getExercises(trainingId);

    return traningPlans;
  }

  @Get(':exerciseId')
  async getExerciseById(@Param('exerciseId') id: string) {
    const traningPlans = await this.exerciseManagementService.getExerciseById(id);

    return traningPlans;
  }

  @Delete(':exerciseId')
  async deleteDayById(@Param('exerciseId') id: string) {
    await this.exerciseManagementService.deleteOne(id);
  }
}

type Input = {
  name: string;
  trainingId: string;
  type: ExerciseType;
  setsNumber: number;
  repsNumber: number;
  description: string;
  observation: string;
};

type Output = {
  id: string;
};
