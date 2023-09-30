import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
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
import { RolesGuard } from 'src/auth/guards/role.guard';
import { RoleEnum } from 'src/models/User';
import { Roles } from 'src/decorators/roles.decorator';
import { UserCreate } from './dto/user-create.dto';
import { RequestUser } from 'src/types/RequestUser';
import { User } from 'src/decorators/request-user.decorator';
import { DeactivateUser } from './dto/deactivate-user.dto';
import { UserQueryDto } from './dto/user-query.dto';

@Controller('/api/users')
export class UserController {
  constructor(@Inject(IUserService) private readonly service: IUserService) {}

  @Post()
  @Roles(RoleEnum.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Body() body: UserCreate,
    @User() user: RequestUser,
  ): Promise<UserResponse> {
    return await this.service.create(body, user);
  }

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
    @Query() query: UserQueryDto,
  ): Promise<ListResponse<UserResponse>> {
    return await this.service.findAll(page, take, query);
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
  @Patch(':id/deactivate')
  @HttpCode(204)
  @Roles(RoleEnum.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deactivate(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: DeactivateUser,
    @User() user: RequestUser,
  ) {
    await this.service.deactivate(userId, body, user);
  }

  @Patch(':id/activate')
  @HttpCode(204)
  @Roles(RoleEnum.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async activate(
    @Param('id', ParseIntPipe) userId: number,
    @User() user: RequestUser,
  ) {
    await this.service.activate(userId, user);
  }
}
