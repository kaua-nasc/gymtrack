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
} from '@azure/storage-blob';

@Injectable()
export class AzureStorageService implements OnModuleInit {
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

    await targetBlobClient.beginCopyFromURL(this.generateSasUrl(sourceBlobName, 5));
  }

  async delete(fileName: string): Promise<void> {
    const containerClient = this.client.getContainerClient(
      this.configService.get('storage.azure.container')
    );

    const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.deleteIfExists();
  }

  generateSasUrl(blobName: string, expiryMinutes = 10): string {
    const now = new Date();
    const expiresOn = new Date(now.valueOf() + expiryMinutes * 60 * 1000);

    const sasToken = generateAccountSASQueryParameters(
      {
        expiresOn,
        permissions: AccountSASPermissions.parse('r'),
        resourceTypes: AccountSASResourceTypes.parse('o').toString(),
        services: AccountSASServices.parse('b').toString(),
        protocol: SASProtocol.HttpsAndHttp,
      },
      (this.client as any).credential
    ).toString();

    const sasUrl = `${this.configService.get(
      'storage.azure.url'
    )}/${blobName}?${sasToken}`;

    return sasUrl;
  }
}
