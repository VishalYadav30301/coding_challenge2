import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class UserService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';
    
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

 
  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async generatePresignedUrl(
    key: string,
    contentType: string,
    expiresIn: number = 900, // 15 minutes
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      this.loggerService.log(`Generated pre-signed URL for key: ${key}`, 'UserService');
      return signedUrl;
    } catch (error) {
      this.loggerService.error(`Error generating pre-signed URL: ${error.message}`, error.stack, 'UserService');
      throw error;
    }
  }

  async generateProfilePictureUploadUrl(
    userId: string,
    fileName: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; fileKey: string }> {
    // Check if user exists
    await this.findById(userId);

    // Generate a unique file key
    const fileExtension = fileName.split('.').pop();
    const fileKey = `profile-pictures/${userId}/${uuidv4()}.${fileExtension}`;

    // Generate pre-signed URL
    const uploadUrl = await this.generatePresignedUrl(
      fileKey,
      contentType,
    );

    this.loggerService.log(`Generated upload URL for user ${userId}`, 'UserService');

    return {
      uploadUrl,
      fileKey,
    };
  }


  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  async updateProfilePicture(userId: string, fileKey: string): Promise<UserDocument> {
    const user = await this.findById(userId);
    
    // Get the public URL for the file
    const profilePictureUrl = this.getPublicUrl(fileKey);
    
    // Update user's profile picture
    user.profilePicture = profilePictureUrl;
    await user.save();
    
    this.loggerService.log(`Updated profile picture for user ${userId}`, 'UserService');
    
    return user;
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
} 