import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '../common/services/logger.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private readonly logger: LoggerService,
    private readonly notificationService: NotificationService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, name } = signupDto;
    
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      name,
      isEmailVerified: true,
    });
    const savedUser = await newUser.save() as any;
    this.logger.log(`New user registered: ${email}`, 'AuthService');
    return {
      message: 'User registered successfully',
      user: {
        name: savedUser.name,
        email: savedUser.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: (user as any)._id.toString(), email: user.email };
    const token = this.jwtService.sign(payload);
    this.logger.log(`User logged in: ${email}`, 'AuthService');
    return {
      access_token: token,
      user: {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  }

  async forgetPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    return this.notificationService.sendPasswordResetOtp(email);
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto) {
    const { email, newPassword } = updatePasswordDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    this.logger.log(`Password updated for user: ${email}`, 'AuthService');
    return { message: 'Password updated successfully' };
  }


  async sendOtp(email: string) {
    return this.notificationService.sendVerificationOtp(email);
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp, newPassword } = verifyOtpDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.notificationService.verifyOtp(email, otp);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Password reset successful' };
  }
}
