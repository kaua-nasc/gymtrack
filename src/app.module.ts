import { Module } from '@nestjs/common';
import { TrainingPlanModule } from './module/training-plan/training-plan.module';
import { ConfigModule } from './module/shared/module/config/config.module';
import { IdentityModule } from './module/identity/identity.module';
import { LoggerModule } from './module/shared/module/logger/logger.module';

@Module({
  imports: [ConfigModule.forRoot(), LoggerModule, TrainingPlanModule, IdentityModule],
})
export class AppModule {}
