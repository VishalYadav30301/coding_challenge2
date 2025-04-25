import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users/api/v1/user')
@UseGuards(JwtAuthGuard)

export class UserController {
  constructor(
    private readonly userService: UserService,
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
  async generateProfilePictureUploadUrl(
    @Req() req: RequestWithUser,
    @Body() data: { fileName: string; contentType: string },
  ) {
    const { fileName, contentType } = data;
    
    return this.userService.generateProfilePictureUploadUrl(
      req.user.sub,
      fileName,
      contentType,
    );
  }

  @Post('update-profile')
  @ApiOperation({ summary: 'Confirm profile picture upload' })
  @ApiResponse({ status: 200, description: 'Profile picture updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async confirmProfilePictureUpload(
    @Req() req: RequestWithUser,
    @Body() data: { fileKey: string },
  ) {
    return this.userService.updateProfilePicture(req.user.sub, data.fileKey);
  }
} 