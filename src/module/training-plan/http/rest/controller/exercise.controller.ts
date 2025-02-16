import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateExerciseUseCase } from '@src/module/training-plan/application/use-case/create-exercise.use-case';
import { DeleteExerciseUseCase } from '@src/module/training-plan/application/use-case/delete-exercise.use-case';
import { GetExerciseUseCase } from '@src/module/training-plan/application/use-case/get-exercise.use-case';
import { ListExerciseUseCase } from '@src/module/training-plan/application/use-case/list-exercise.use-case';
import { ExerciseManagementService } from '@src/module/training-plan/core/service/exercise-management.service';
import { CreateExerciseRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-exercise-request.dto';

@Controller('exercise')
export class ExerciseController {
  constructor(
    private readonly exerciseManagementService: ExerciseManagementService,
    private readonly listExerciseUseCase: ListExerciseUseCase,
    private readonly createExerciseUseCase: CreateExerciseUseCase,
    private readonly getExerciseUseCase: GetExerciseUseCase,
    private readonly deleteExerciseUseCase: DeleteExerciseUseCase
  ) {}

  @Post()
  async createExercise(@Body() contentData: CreateExerciseRequestDto): Promise<Output> {
    return await this.createExerciseUseCase.execute({ ...contentData });
  }

  @Get('list/:trainingId')
  async findExecisesByDayId(@Param('trainingId') trainingId: string) {
    return await this.listExerciseUseCase.execute(trainingId);
  }

  @Get(':exerciseId')
  async findExeciseById(@Param('exerciseId') id: string) {
    return await this.getExerciseUseCase.execute(id);
  }

  @Delete(':exerciseId')
  async deleteExerciseById(@Param('exerciseId') id: string) {
    await this.deleteExerciseUseCase.execute(id);
  }
}

type Output = {
  id: string;
};
