import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserMetricsService } from '@src/module/identity/core/service/user-metrics.service';
import { ZodBody } from '@src/module/shared/http/decorator/zod-body.decorator';
import { JwtAuthGuard } from '@src/module/shared/module/auth/guard/jwt-auth.guard';
import { UpdateTrainerNoteRequestDto } from '../dto/request/update-trainer-note-request.dto';
import {
  updateTrainerNoteRequestSchema,
  type UpdateTrainerNoteRequestSchema,
} from '../schema/identity-request.schema';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('identity/user/trainer')
export class UserTrainerController {
  constructor(private readonly userMetricsService: UserMetricsService) {}

  @Get('students/:studentId/metrics/goals')
  @ApiOperation({ summary: 'Get metric goals of a linked student (Trainer only)' })
  async getStudentMetricGoals(@Param('studentId') studentId: string) {
    return await this.userMetricsService.getStudentMetricGoals(studentId);
  }

  @Patch('weight-log/:id/note')
  @ApiOperation({ summary: 'Update trainer note on a weight log (Trainer only)' })
  @ApiBody({ type: UpdateTrainerNoteRequestDto })
  async updateWeightLogNote(
    @Param('id') id: string,
    @ZodBody(updateTrainerNoteRequestSchema) dto: UpdateTrainerNoteRequestSchema
  ): Promise<void> {
    await this.userMetricsService.addWeightLogNote(id, dto.note);
  }

  @Patch('body-measurement/:id/note')
  @ApiOperation({ summary: 'Update trainer note on a body measurement (Trainer only)' })
  @ApiBody({ type: UpdateTrainerNoteRequestDto })
  async updateBodyMeasurementNote(
    @Param('id') id: string,
    @ZodBody(updateTrainerNoteRequestSchema) dto: UpdateTrainerNoteRequestSchema
  ): Promise<void> {
    await this.userMetricsService.addBodyMeasurementNote(id, dto.note);
  }
}
