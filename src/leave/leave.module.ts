import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { Leave, LeaveSchema } from './schemas/leave.schema';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Leave.name, schema: LeaveSchema }]),
    CommonModule,
  ],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {} 