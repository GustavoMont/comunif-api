import {
  Body,
  Controller,
  Delete,
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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommunityResponse } from './dto/community-response.dto';
import { CommunityUpdate } from './dto/community-update.dto';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleEnum } from 'src/models/User';
import { FileInterceptor } from '@nestjs/platform-express';
import { bannerUploadOptions, validators } from 'src/config/image-uploads';
import { PathPipe } from 'src/pipes/image-path.pipe';
import { SharpPipe } from 'src/pipes/sharp-image.pipe';
import { ListResponse } from 'src/dtos/list.dto';
import { User } from 'src/decorators/request-user.decorator';
import { RequestUser } from 'src/types/RequestUser';
import { ParseIntUndefinedPipe } from 'src/pipes/parse-int-undefined.pipe';
import { CommunityQueryDto } from './dto/community-query.dto';
import { CreateCommunity } from './dto/community-create.dto';
import { ICommunityService } from './interfaces/ICommunityService';

@Controller('api/communities')
export class CommunityController {
  constructor(
    @Inject(ICommunityService) private readonly service: ICommunityService,
  ) {}

  @Roles(RoleEnum.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('banner', bannerUploadOptions))
  @Post()
  async create(
    @User() user: RequestUser,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators,
      }),
      SharpPipe,
      PathPipe,
    )
    banner: string,
    @Body() body: CreateCommunity,
  ) {
    if (banner) {
      body.banner = banner;
    }
    return await this.service.create(user, body);
  }

  @Roles(RoleEnum.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @User() user: RequestUser,
  ) {
    return await this.service.delete(user, id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @User() user: RequestUser,
    @Query('take', ParseIntUndefinedPipe) take: number,
    @Query('page', ParseIntUndefinedPipe) page: number,
    @Query() query: CommunityQueryDto,
  ): Promise<ListResponse<CommunityResponse>> {
    return await this.service.findAll(user, query, take, page);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @User() user: RequestUser,
  ): Promise<CommunityResponse> {
    return await this.service.findById(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:userId')
  async findUserCommunities(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<CommunityResponse[]> {
    return await this.service.findUserCommunities(+userId);
  }

  @Roles(RoleEnum.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('banner', bannerUploadOptions))
  async update(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators,
      }),
      SharpPipe,
      PathPipe,
    )
    banner: string,
    @Param('id', ParseIntPipe)
    id: number,
    @Body() body: CommunityUpdate,
  ): Promise<CommunityResponse> {
    if (banner) {
      body.banner = banner;
    }
    return await this.service.update(id, body);
  }
}
