import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/types/RequestWithUser';
import { CommunityService } from './community.service';
import { CommunityAddUser } from './dto/community-add-user.dto';
import { CommunityResponse } from './dto/community-response.dto';
import { CommunityUpdate } from './dto/community-update.dto';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleEnum } from 'src/models/User';

@Controller('api/communities')
export class CommunityController {
  constructor(private readonly service: CommunityService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findALl(): Promise<CommunityResponse[]> {
    return await this.service.findAll();
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommunityResponse> {
    return await this.service.findById(id);
  }
  @UseGuards(JwtAuthGuard)
  @Post('add-user')
  async addUser(
    @Body() body: CommunityAddUser,
    @Req() req: RequestWithUser,
  ): Promise<CommunityResponse> {
    return await this.service.addUser(req.user.id, body.communityId);
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
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CommunityUpdate,
  ): Promise<CommunityResponse> {
    return await this.service.update(id, body);
  }
}
