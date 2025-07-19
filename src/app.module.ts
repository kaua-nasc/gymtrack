import { Module } from '@nestjs/common';
import { TrainingPlanModule } from './module/training-plan/training-plan.module';
import { ConfigModule } from './module/shared/module/config/config.module';
import { IdentityModule } from './module/identity/identity.module';

@Module({
  imports: [ConfigModule.forRoot(), TrainingPlanModule, IdentityModule],
})
export class AppModule {}
