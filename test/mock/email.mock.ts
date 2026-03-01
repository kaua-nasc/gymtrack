import { mock } from 'bun:test';
import { Global, Module } from '@nestjs/common';
import { EmailService } from '@src/module/shared/module/email/service/email.service';

export const mockEmailService = {
  sendEmail: mock(() => Promise.resolve()),
};

@Global()
@Module({
  providers: [
    {
      provide: EmailService,
      useValue: mockEmailService,
    },
  ],
  exports: [EmailService],
})
export class MockEmailModule {}
