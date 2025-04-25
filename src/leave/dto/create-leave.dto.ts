import { IsEnum, IsNotEmpty, IsString, IsDate, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { LeaveType } from '../schemas/leave.schema';

export class CreateLeaveDto {
  @IsEnum(LeaveType)
  @IsNotEmpty()
  leaveType: LeaveType;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  reason: string;
} 