import Redis from 'ioredis';

class TestCacheClient {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.CACHE_HOST,
      port: Number(process.env.CACHE_PORT),
      db: Number(process.env.CACHE_DB),
      password: process.env.CACHE_PASSWORD,
    });
  }

  public async clean(): Promise<void> {
    await this.redis.flushdb();
  }

  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  public async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  public async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

export const testCacheClient = new TestCacheClient();
