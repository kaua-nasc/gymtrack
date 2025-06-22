import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ExerciseManagementService } from '@src/module/training-plan/core/service/exercise-management.service';
import { CreateExerciseRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-exercise-request.dto';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseManagementService: ExerciseManagementService) {}

  @Post()
  async createExercise(@Body() contentData: CreateExerciseRequestDto): Promise<Output> {
    return await this.exerciseManagementService.create({ ...contentData });
  }

  @Get('list/:trainingId')
  async findExecisesByDayId(@Param('trainingId') trainingId: string) {
    return await this.exerciseManagementService.execute(trainingId);
  }

  @Get(':exerciseId')
  async findExeciseById(@Param('exerciseId') id: string) {
    return await this.exerciseManagementService.get(id);
  }

  @Delete(':exerciseId')
  async deleteExerciseById(@Param('exerciseId') id: string) {
    await this.exerciseManagementService.delete(id);
  }
}

type Output = {
  id: string;
};
