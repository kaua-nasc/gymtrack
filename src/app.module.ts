import { Module } from "@nestjs/common";
import { IdentityModule } from "./module/identity/identity.module";
import { ConfigModule } from "./module/shared/module/config/config.module";
import { LoggerModule } from "./module/shared/module/logger/logger.module";
import { TrainingPlanModule } from "./module/training-plan/training-plan.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule,
    TrainingPlanModule,
    IdentityModule,
  ],
})
export class AppModule {}
