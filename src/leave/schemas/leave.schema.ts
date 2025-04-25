import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export enum LeaveType {
  PLANNED = 'PLANNED',
  EMERGENCY = 'EMERGENCY',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Leave extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true, enum: LeaveType })
  leaveType: LeaveType;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  reason: string;

  @Prop({ default: LeaveStatus.PENDING, enum: LeaveStatus })
  status: LeaveStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  approvedBy: User;

  @Prop()
  rejectionReason: string;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave); 