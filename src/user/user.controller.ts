import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerGuard } from 'src/auth/guards/owner-auth.guard';
import { UserResponse } from './dto/user-response.dto';
import { UserUpdate } from './dto/user-update.dto';
import { SharpPipe } from '../pipes/sharp-image.pipe';

import { UserService } from './user.service';
import { avatarUploadOptions, validators } from 'src/config/image-uploads';
import { UserUpdatePipe } from './pipes/user-update.pipe';
import { PathPipe } from 'src/pipes/image-path.pipe';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('/api/users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: number): Promise<UserResponse> {
    return this.service.findById(+id);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<UserResponse[]> {
    return await this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() body: UserUpdate,
  ): Promise<UserResponse> {
    return await this.service.update(id, body);
  }

  @Patch(':id/avatar')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @UseInterceptors(FileInterceptor('avatar', avatarUploadOptions))
  async updateAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators,
      }),
      SharpPipe,
      PathPipe,
      UserUpdatePipe,
    )
    update: UserUpdate,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponse> {
    return this.service.update(+id, update);
  }

  @Post('reset-password')
  @HttpCode(204)
  async resetPassword(@Body() body: ResetPasswordDto): Promise<void> {
    await this.service.resetPassword(body);
  }
}
