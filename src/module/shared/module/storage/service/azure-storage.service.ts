import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../../config/service/config.service';
import { DefaultAzureCredential } from '@azure/identity';
import {
  BlobSASPermissions,
  BlobServiceClient,
  BlockBlobClient,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';

@Injectable()
export class AzureStorageService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  private readonly credential = new DefaultAzureCredential({});
  private client: BlobServiceClient;

  onModuleInit() {
    this.client = new BlobServiceClient(
      `https://${this.configService.get('storage.azure.account')}.blob.core.windows.net`,
      this.credential
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

  async generateSasUrl(blobName: string, expiryMinutes = 10) {
    const now = new Date();
    const userDelegationKey = await this.client.getUserDelegationKey(
      now,
      new Date(now.valueOf() + expiryMinutes * 60 * 1000)
    );

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.configService.get('storage.azure.container'),
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: now,
        expiresOn: new Date(now.valueOf() + expiryMinutes * 60 * 1000),
      },
      userDelegationKey,
      this.configService.get('storage.azure.account')
    ).toString();

    const sasUrl = `https://${this.configService.get('storage.azure.account')}.blob.core.windows.net/${this.configService.get('storage.azure.container')}/${blobName}?${sasToken}`;
    return sasUrl;
  }
}
