import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerGuard } from 'src/auth/guards/owner-auth.guard';
import { avatarUploadOptions } from './config/multer';
import { UserResponse } from './dto/user-response.dto';
import { UserUpdate } from './dto/user-update.dto';
import { SharpPipe } from './pipes/avatar-image.pipe';
import { PathPipe } from './pipes/path-avatar.pipe';

import { UserService } from './user.service';

const validators = [
  new MaxFileSizeValidator({ maxSize: 1000 * 800 }),
  new FileTypeValidator({ fileType: 'image/*' }),
];

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
    )
    update: UserUpdate,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponse> {
    return this.service.update(+id, update);
  }
}
