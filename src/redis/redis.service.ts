import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType;

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    this.client = createClient({
      url: this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
    });
    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
      this.logger.log('Connected to Redis');
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, { EX: ttl });
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string> {
    const value = await this.client.get(key);
    return value || '';
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
} 