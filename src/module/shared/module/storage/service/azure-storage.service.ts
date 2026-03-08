import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../../config/service/config.service';
import {
  BlobServiceClient,
  BlockBlobClient,
  generateAccountSASQueryParameters,
  AccountSASPermissions,
  AccountSASResourceTypes,
  AccountSASServices,
  SASProtocol,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';

export interface StorageService {
  upload(fileName: string, buffer: Buffer): Promise<void>;
  copy(sourceBlobName: string, targetBlobName: string): Promise<void>;
  delete(fileName: string): Promise<void>;
  generateUrl(blobName: string): string;
}

@Injectable()
export class AzureStorageService implements StorageService, OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  private client: BlobServiceClient;

  onModuleInit() {
    this.client = BlobServiceClient.fromConnectionString(
      this.configService.get('storage.azure.connectionString')
    );
  }

  async upload(fileName: string, buffer: Buffer): Promise<void> {
    const containerClient = this.client.getContainerClient(
      this.configService.get('storage.azure.container')
    );
    await containerClient.createIfNotExists();

    const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.upload(buffer, buffer.length);
  }

  async copy(sourceBlobName: string, targetBlobName: string): Promise<void> {
    const containerClient = this.client.getContainerClient(
      this.configService.get('storage.azure.container')
    );

    const targetBlobClient = containerClient.getBlockBlobClient(targetBlobName);

    await targetBlobClient.beginCopyFromURL(this.generateUrl(sourceBlobName));
  }

  async delete(fileName: string): Promise<void> {
    const containerClient = this.client.getContainerClient(
      this.configService.get('storage.azure.container')
    );

    const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.deleteIfExists();
  }

  generateUrl(blobName: string): string {
    const sasUrl = `${this.configService.get(
      'storage.azure.url'
    )}/${blobName}`;

    return sasUrl;
  }
}
