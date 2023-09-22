import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Query,
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
import { avatarUploadOptions, validators } from 'src/config/image-uploads';
import { UserUpdatePipe } from './pipes/user-update.pipe';
import { PathPipe } from 'src/pipes/image-path.pipe';
import { ListResponse } from 'src/dtos/list.dto';
import { IUserService } from './interfaces/IUserService';
import { ParseIntUndefinedPipe } from 'src/pipes/parse-int-undefined.pipe';

@Controller('/api/users')
export class UserController {
  constructor(@Inject(IUserService) private readonly service: IUserService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: number): Promise<UserResponse> {
    return this.service.findById(+id);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('page', ParseIntUndefinedPipe) page,
    @Query('take', ParseIntUndefinedPipe) take,
  ): Promise<ListResponse<UserResponse>> {
    return await this.service.findAll(page, take);
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
}
