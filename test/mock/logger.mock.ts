import { mock } from 'bun:test';
import { Global, Module } from '@nestjs/common';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';

export const mockAppLogger = {
  log: mock((_: string, __?: unknown) => void 0),
  error: mock((_: string, __?: unknown) => void 0),
  warn: mock((_: string, __?: unknown) => void 0),
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
