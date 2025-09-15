import { DynamicModule, Module, Provider } from '@nestjs/common';
import { CacheService } from './service/cache.service';
import Redis, { RedisOptions } from 'ioredis';
import { ConfigModule } from '../config/config.module';

export interface CacheModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (...args: any[]) => RedisOptions | Promise<RedisOptions>;
}

@Module({})
export class CacheModule {
  static forRootAsync(options: CacheModuleAsyncOptions): DynamicModule {
    const redisProvider: Provider = {
      provide: 'REDIS_CLIENT',
      inject: options.inject || [],
      useFactory: async (...args: any[]) => {
        const redisOptions: RedisOptions = await options.useFactory(...args);
        return new Redis(redisOptions);
      },
    };

    return {
      module: CacheModule,
      imports: options.imports || [ConfigModule.forRoot()],
      providers: [redisProvider, CacheService],
      exports: [CacheService],
    };
  }
}
