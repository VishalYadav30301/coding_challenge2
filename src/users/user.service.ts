import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { LoggerService } from '../common/services/logger.service';
import { S3Service } from '../s3_bucket/s3.service';


@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly loggerService: LoggerService,
    private readonly s3Service: S3Service,
  ) {}
  async getProfile(userId: string): Promise<UserDocument> {
    this.loggerService.log(`Getting profile for user ${userId}`, 'UserService');
    return this.findById(userId);
  }

  async generateProfilePictureUploadUrl(
    userId: string,
    fileName: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; fileKey: string }> {
    await this.findById(userId);
    const result = await this.s3Service.generatePreSignedUrl(
      userId,
      fileName,
      
    );

    this.loggerService.log(`Generated upload URL for user ${userId}`, 'UserService');
    return { uploadUrl: result, fileKey: userId };
  }

  async updateProfile(
    userId: string,
    updateData: { name?: string; profilePicture?: string },
  ): Promise<UserDocument> {
    const user = await this.findById(userId);
    if (updateData.name) {
      user.name = updateData.name;
    }
    if (updateData.profilePicture) {
      user.profilePicture = updateData.profilePicture;
    }
    await user.save();
    
    this.loggerService.log(`Updated profile for user ${userId}`, 'UserService');
    
    return user;
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }


} 