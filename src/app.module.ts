import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { LeaveModule } from './leave/leave.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/',
      }),
    }),
    CommonModule,
    AuthModule,
    UserModule,
    LeaveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
