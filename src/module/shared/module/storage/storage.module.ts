import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { AzureStorageService } from './service/azure-storage.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [AzureStorageService],
  exports: [AzureStorageService],
})
export class StorageModule {}
