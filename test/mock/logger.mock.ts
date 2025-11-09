// src/module/identity/__test__/mock/logger.mock.ts
import { Global, Module } from '@nestjs/common';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';

export const mockAppLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

@Global()
@Module({
  providers: [
    {
      provide: AppLogger,
      useValue: mockAppLogger,
    },
  ],
  exports: [AppLogger],
})
export class MockLoggerModule {}
