import { Controller, Post, Get, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { LeaveType } from './schemas/leave.schema';

@Controller('users/api/v1/leave')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  async createLeave(
    @Req() req: RequestWithUser,
    @Body() createLeaveDto: CreateLeaveDto,
  ) {
    return this.leaveService.createLeave(req.user.sub, createLeaveDto);
  }

  @Get()
  async getLeaves(
    @Req() req: RequestWithUser,
    @Query('leaveType') leaveType?: LeaveType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leaveService.getLeaves(req.user.sub, leaveType, page, limit);
  }

  @Get(':leaveId')
  async getLeaveById(
    @Req() req: RequestWithUser,
    @Param('leaveId') leaveId: string,
  ) {
    return this.leaveService.getLeaveById(leaveId, req.user.sub);
  }
} 