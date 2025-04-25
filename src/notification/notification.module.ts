import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { CommonModule } from '../common/common.module';
import { RedisModule } from '../redis/redis.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    ConfigModule, 
    CommonModule, 
    RedisModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {} 