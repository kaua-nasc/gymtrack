import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TypeOrmMigrationService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async migrate(): Promise<void> {
    const pendingMigrations = await this.dataSource.showMigrations();
    if (pendingMigrations) {
      const appliedMigrations = await this.dataSource.runMigrations();
      console.log('Applied migrations:', appliedMigrations);
    }
  }

  async getDataSource(): Promise<DataSource> {
    return this.dataSource;
  }
}
