import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { LoggerService } from '../common/services/logger.service';
import { RedisService } from '../redis/redis.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;
  private readonly OTP_EXPIRY = 300000; // 5 minutes in milliseconds

  constructor(
    private configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly redisService: RedisService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('GMAIL_USER'),
        pass: this.configService.get('GMAIL_APP_PASSWORD'),
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('GMAIL_USER'),
        to,
        subject,
        text,
      });
      this.logger.log(`Email sent successfully to ${to}`, 'NotificationService');
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${error.message}`,
        error.stack,
        'NotificationService',
      );
      throw new BadRequestException('Failed to send email');
    }
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtpEmail(email: string, otp: string, purpose: string = 'verification') {
    const subject = purpose === 'verification' 
      ? 'Email Verification OTP' 
      : 'Password Reset OTP';
    
    const text = `Your OTP for ${purpose} is: ${otp}. This OTP will expire in 5 minutes.`;
    
    await this.sendEmail(email, subject, text);
  }

  async sendPasswordResetOtp(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      this.logger.log(`Password reset attempted for non-existent email: ${email}`, 'NotificationService');
      return { message: 'If your email is registered, you will receive an OTP shortly' };
    }

    const otp = this.generateOtp();
    const otpKey = `otp:${email}`;
    
    // Store OTP in Redis with 5 minutes expiration
    await this.redisService.set(otpKey, otp, this.OTP_EXPIRY / 1000); // Convert to seconds for Redis
    
    // Send OTP email
    await this.sendOtpEmail(email, otp, 'password reset');
    
    this.logger.log(`Password reset OTP sent to: ${email}`, 'NotificationService');
    return { message: 'If your email is registered, you will receive an OTP shortly' };
  }

  async sendVerificationOtp(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = this.generateOtp();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5); // OTP expires in 5 minutes
    
    // Update user with OTP and expiry
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    
    this.logger.log(`Updated user OTP in database for email: ${email}`, 'NotificationService');

    // Store OTP in Redis with 5 minutes expiration
    await this.redisService.set(`otp:${email}`, otp, 300);
    
    // Log that OTP was stored in Redis
    this.logger.log(`OTP stored in Redis for email: ${email}`, 'NotificationService');

    // Send OTP email
    await this.sendOtpEmail(email, otp, 'verification');

    this.logger.log(`OTP sent to: ${email}`, 'NotificationService');

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this.redisService.get(`otp:${email}`);
    this.logger.log(`Retrieved OTP from Redis for email: ${email}, stored: ${storedOtp}, provided: ${otp}`, 'NotificationService');
    
    if (!storedOtp) {
      throw new BadRequestException('OTP has expired or not found');
    }

    if (otp !== storedOtp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Delete OTP from Redis after successful verification
    await this.redisService.del(`otp:${email}`);
    this.logger.log(`OTP deleted from Redis for email: ${email}`, 'NotificationService');

    return true;
  }
} 