import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '../../config/service/config.service';

@Injectable()
export class AwsStorageService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}
  private client: Client;

  onModuleInit() {
    this.client = new Client({
      endPoint: this.configService.get('storage.aws.endpoint'),
      port: this.configService.get('storage.aws.port'),
      useSSL: true,
      accessKey: this.configService.get('storage.aws.accessKey'),
      secretKey: this.configService.get('storage.aws.secretKey'),
      region: this.configService.get('storage.aws.region'),
    });
  }

  async upload(fileName: string, buffer: Buffer): Promise<string> {
    const bucket = this.configService.get('storage.aws.bucket');
    await this.client.putObject(bucket, fileName, buffer);

    return `https://${bucket}.${this.configService.get('storage.aws.endpoint')}/${fileName}`;
  }

  async get(bucket: string, fileName: string) {
    return this.client.getObject(bucket, fileName);
  }

  async delete(bucket: string, fileName: string) {
    await this.client.removeObject(bucket, fileName);
  }

  //   async list(bucket: string) {
  // const stream = this.client.listObjects(bucket, '', true);
  // const files: string[] = [];
  // return new Promise<string[]>((resolve, reject) => {
  //   stream.on('data', (obj) => files.push(obj.name));
  //   stream.on('end', () => resolve(files));
  //   stream.on('error', reject);
  // });
  //   }
}
