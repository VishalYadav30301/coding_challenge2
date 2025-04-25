import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../common/common.module';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule, CommonModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {} 