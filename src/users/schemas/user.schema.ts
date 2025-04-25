import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ required: false })
  profilePicture?: string;

  @Prop({ required: false, type: String })
  otp?: string;

  @Prop({ required: false, type: Date })
  otpExpiry?: Date;

  @Prop({ required: false })
  resetPasswordToken?: string;

  @Prop({ required: false })
  resetPasswordExpiry?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User); 