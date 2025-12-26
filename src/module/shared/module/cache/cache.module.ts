import {
  DynamicModule,
  ForwardReference,
  InjectionToken,
  Module,
  OptionalFactoryDependency,
  Provider,
  Type,
} from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { ConfigModule } from '../config/config.module';
import { CacheService } from './service/cache.service';

export interface CacheModuleAsyncOptions {
  imports?: (
    | Type<unknown>
    | DynamicModule
    | Promise<DynamicModule>
    | ForwardReference<unknown>
  )[];
  inject?: (InjectionToken | OptionalFactoryDependency)[];
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  useFactory: (...args: any[]) => RedisOptions | Promise<RedisOptions>;
}

@Module({})
export class CacheModule {
  static forRootAsync(options: CacheModuleAsyncOptions): DynamicModule {
    const redisProvider: Provider = {
      provide: 'REDIS_CLIENT',
      inject: options.inject || [],
      useFactory: async (...args: unknown[]) => {
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
