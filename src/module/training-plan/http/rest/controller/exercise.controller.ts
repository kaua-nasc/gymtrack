import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/module/shared/module/auth/guard/jwt-auth.guard';
import { ExerciseManagementService } from '@src/module/training-plan/core/service/exercise-management.service';
import { CreateExerciseRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-exercise-request.dto';
import { ExerciseResponseDto } from '../dto/response/exercise-response.dto';

@ApiTags('Exercises')
@UseGuards(JwtAuthGuard)
@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseManagementService: ExerciseManagementService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo exercício' })
  @ApiBody({ type: CreateExerciseRequestDto })
  @ApiResponse({ status: 201, description: 'Exercício criado com sucesso' })
  async createExercise(@Body() contentData: CreateExerciseRequestDto): Promise<void> {
    await this.exerciseManagementService.create({ ...contentData });
  }

  @Get('list/:trainingId')
  @ApiOperation({ summary: 'Lista todos os exercícios de um treinamento' })
  @ApiParam({ name: 'trainingId', description: 'ID do treinamento' })
  @ApiResponse({
    status: 200,
    description: 'Lista de exercícios',
    type: [ExerciseResponseDto],
  })
  async findExecisesByDayId(
    @Param('trainingId') trainingId: string
  ): Promise<ExerciseResponseDto[]> {
    return await this.exerciseManagementService.execute(trainingId);
  }

  @Get(':exerciseId')
  @ApiOperation({ summary: 'Busca um exercício pelo ID' })
  @ApiParam({ name: 'exerciseId', description: 'ID do exercício' })
  @ApiResponse({
    status: 200,
    description: 'Exercício encontrado',
    type: ExerciseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Exercício não encontrado' })
  async findExeciseById(@Param('exerciseId') id: string): Promise<ExerciseResponseDto> {
    const exercise = await this.exerciseManagementService.get(id);
    return { ...exercise };
  }

  @Delete(':exerciseId')
  @ApiOperation({ summary: 'Deleta um exercício pelo ID' })
  @ApiParam({ name: 'exerciseId', description: 'ID do exercício' })
  @ApiResponse({ status: 200, description: 'Exercício deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Exercício não encontrado' })
  async deleteExerciseById(@Param('exerciseId') id: string): Promise<void> {
    await this.exerciseManagementService.delete(id);
  }
}
