import { Module } from '@nestjs/common';
import { EmailService } from './service/email.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
