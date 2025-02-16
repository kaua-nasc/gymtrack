import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ExerciseManagementService } from '@src/module/training-plan/core/service/exercise-management.service';
import { CreateExerciseRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-exercise-request.dto';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseManagementService: ExerciseManagementService) {}

  @Post()
  async createExercise(@Body() contentData: CreateExerciseRequestDto): Promise<Output> {
    const createTraining = await this.exerciseManagementService.createExercise({
      ...contentData,
    });

    return {
      id: createTraining.id,
    };
  }

  //@Post('withDay')
  //async createTrainingWithDay(@Body() contentData: A): Promise<Output> {
  //  const createdTraining = await this.dayManagementService.createDay({
  //    trainingPlanId: contentData.trainingPlanId,
  //    name: contentData.trainingName,
  //    exercises: [],
  //  });

  //  const createTraining = await this.exerciseManagementService.createExercise({
  //    ...contentData,
  //    dayId: createdTraining.id,
  //  });

  //  return {
  //    id: createTraining.id,
  //  };
  //}

  @Get('list/:trainingId')
  async findExecisesByDayId(@Param('trainingId') trainingId: string) {
    const traningPlans =
      await this.exerciseManagementService.findExecisesByDayId(trainingId);

    return traningPlans;
  }

  @Get(':exerciseId')
  async findExeciseById(@Param('exerciseId') id: string) {
    const traningPlans = await this.exerciseManagementService.findExeciseById(id);

    return traningPlans;
  }

  @Delete(':exerciseId')
  async deleteExerciseById(@Param('exerciseId') id: string) {
    await this.exerciseManagementService.deleteExerciseById(id);
  }
}

type Output = {
  id: string;
};
