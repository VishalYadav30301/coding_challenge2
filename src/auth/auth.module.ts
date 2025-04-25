import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CommonModule } from '../common/common.module';
import { CacheModule } from '@nestjs/cache-manager';
import { NotificationModule } from '../notification/notification.module';
import { RedisModule } from '../redis/redis.module';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../users/user.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CommonModule,
    CacheModule.register({
      ttl: 300, // 5 minutes
      max: 100,
    }),
    NotificationModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, NotificationService, UserService],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
