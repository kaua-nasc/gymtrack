import { Module } from '@nestjs/common';
import { EmailService } from './service/email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
