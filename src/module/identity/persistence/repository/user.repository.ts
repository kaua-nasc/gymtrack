import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';
import { User } from '../entity/user.entity';
import { CacheService } from '@src/module/shared/module/cache/service/cache.service';

@Injectable()
export class UserRepository extends DefaultTypeOrmRepository<User> {
  constructor(
    @InjectDataSource('identity')
    dataSource: DataSource,
    private readonly cacheService: CacheService
  ) {
    super(User, dataSource.manager);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.find({
      where: { email },
    });
  }

  async findResetCode(email: string): Promise<string | null> {
    return await this.cacheService.get<string>(email);
  }

  async removeResetCode(email: string): Promise<void> {
    await this.cacheService.del(email);
  }

  async saveResetCode(token: string, email: string, expiration: number): Promise<void> {
    await this.cacheService.set(email, token, expiration);
  }

  async getResetCode(email: string) {
    return await this.cacheService.get(email);
  }
}
