import { mock } from 'bun:test';
import { Module } from '@nestjs/common';
import {
  AzureStorageService,
  StorageService,
} from '@src/module/shared/module/storage/service/azure-storage.service';

export class MockAzureStorageService implements StorageService {
  upload = mock<StorageService['upload']>().mockResolvedValue(undefined);
  copy = mock<StorageService['copy']>().mockResolvedValue(undefined);
  delete = mock<StorageService['delete']>().mockResolvedValue(undefined);
  generateSasUrl = mock<StorageService['generateSasUrl']>().mockImplementation(
    (blobName: string) => `https://fake.local/${blobName}?mockedToken=123`
  );
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
