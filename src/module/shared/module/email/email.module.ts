import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { EmailService } from './service/email.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
