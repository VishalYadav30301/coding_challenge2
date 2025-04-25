import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leave, LeaveType, LeaveStatus } from './schemas/leave.schema';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class LeaveService {
  constructor(
    @InjectModel(Leave.name) private leaveModel: Model<Leave>,
    private readonly logger: LoggerService,
  ) {}

  async createLeave(userId: string, createLeaveDto: CreateLeaveDto) {
    const { startDate, endDate, leaveType } = createLeaveDto;
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    if (startDate < threeDaysAgo) {
      throw new BadRequestException('Cannot apply for leaves older than 3 days');
    }
    const existingLeave = await this.leaveModel.findOne({
      userId,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
      status: { $ne: LeaveStatus.REJECTED },
    });

    if (existingLeave) {
      throw new BadRequestException('You already have a leave request for these dates');
    }

    // Create new leave request
    const leave = new this.leaveModel({
      ...createLeaveDto,
      userId,
      status: LeaveStatus.PENDING,
    });

    await leave.save();
    this.logger.log(`Leave request created for user: ${userId}`, 'LeaveService');

    return leave;
  }

  async getLeaves(userId: string, leaveType?: LeaveType, page = 1, limit = 10) {
    const query: any = { userId };
    if (leaveType) {
      query.leaveType = leaveType;
    }

    const skip = (page - 1) * limit;
    const [leaves, total] = await Promise.all([
      this.leaveModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.leaveModel.countDocuments(query),
    ]);

    return {
      leaves,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLeaveById(leaveId: string, userId: string) {
    const leave = await this.leaveModel.findOne({ _id: leaveId, userId });
    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }
    return leave;
  }
} 