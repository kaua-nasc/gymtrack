// src/module/identity/__test__/mock/logger.mock.ts
import { Module } from '@nestjs/common';
import { AzureStorageService } from '@src/module/shared/module/storage/service/azure-storage.service';

export class MockAzureStorageService {
  upload = jest.fn().mockResolvedValue(undefined);
  delete = jest.fn().mockResolvedValue(undefined);
  generateSasUrl = jest.fn((blobName: string) => {
    return `https://fake.local/${blobName}?mockedToken=123`;
  });
}

@Module({
  providers: [
    {
      provide: AzureStorageService,
      useClass: MockAzureStorageService,
    },
  ],
  exports: [AzureStorageService],
})
export class MockStorageModule {}
