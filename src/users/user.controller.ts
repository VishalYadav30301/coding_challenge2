import { databaseNameString } from './../../node_modules/aws-sdk/clients/glue.d';
import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { S3Service } from '../s3_bucket/s3.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users/api/v1')
@UseGuards(JwtAuthGuard)

export class UserController {
  
  constructor(
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
    
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@Req() req: RequestWithUser) {
    return this.userService.findById(req.user.sub);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateData: { name?: string },
  ) {
    return this.userService.updateProfile(req.user.sub, updateData);
  }

  @Post('upload-url')
  @ApiOperation({ summary: 'Generate pre-signed URL for profile picture upload' })
  @ApiResponse({ status: 200, description: 'Returns pre-signed URL and file key' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async PreSignedUrl(
    @Req() req: RequestWithUser,
    @Body() data: { fileName: string; contentType: string },
  ) {
    const { fileName, contentType } = data;
    const key = `users/${req.user.sub}/${fileName}`;
    const url = await this.s3Service.generatePreSignedUrl(
      key,
      contentType,
      3000
    );
    const publicUrl = this.s3Service.getPublicUrl(key);
    await this.userService.updateProfile(req.user.sub, {
      profilePicture: publicUrl
    });

    return {
      url,
      key,
      publicUrl
    };
  }

  @Get('getProfile')
  @ApiOperation({ summary: 'Generate pre-signed URL for profile picture upload' })
  @ApiResponse({ status: 200, description: 'Returns pre-signed URL and file key' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfileUrl(@Req() req: RequestWithUser) {
    return this.s3Service.getDownloadUrl(req.user.sub);
  }

} 