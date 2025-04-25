import { Controller, Post, Body, Get, UseGuards, Req, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { NotificationService } from '../notification/notification.service';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { UserService } from '../users/user.service';

@Controller('users/api/v1')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forget-password')
  async forgetPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgetPassword(forgotPasswordDto);
  }

  @Post('update-password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() req: RequestWithUser,
  ) {
    const updatedDto = {
      ...updatePasswordDto,
      email: req.user.email,
    };
    return this.authService.updatePassword(updatedDto);
  }

  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto.email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.sendOtp(resendOtpDto.email);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: RequestWithUser) {
    return this.userService.getProfile(req.user.sub);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(req.user.sub, updateProfileDto);
  }
}
