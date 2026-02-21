import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { IdentityModule } from './module/identity/identity.module';
import { ConfigModule } from './module/shared/module/config/config.module';
import { LoggerModule } from './module/shared/module/logger/logger.module';
import { TrainingPlanModule } from './module/training-plan/training-plan.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
      },
    }),
    LoggerModule,
    TrainingPlanModule,
    IdentityModule,
  ],
})
export class AppModule {}
