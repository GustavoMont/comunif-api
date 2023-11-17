import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommunityAddUser } from 'src/community/dto/community-add-user.dto';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { ICommunityUsersService } from './interfaces/ICommunityUsersService';
import { ParseIntUndefinedPipe } from 'src/pipes/parse-int-undefined.pipe';
import { User } from 'src/decorators/request-user.decorator';
import { RequestUser } from 'src/types/RequestUser';

@Controller('api/community-users')
export class CommunityUsersController {
  constructor(
    @Inject(ICommunityUsersService)
    private readonly service: ICommunityUsersService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  async addUser(
    @Body() body: CommunityAddUser,
    @User() user: RequestUser,
  ): Promise<CommunityResponse> {
    return await this.service.addUser(body.communityId, user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  async findCommunityMembrs(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntUndefinedPipe) page: number,
    @Query('take', ParseIntUndefinedPipe) take: number,
  ) {
    return await this.service.findCommunityMembers(id, page, take);
  }
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':communityId/members/:userId')
  async userLeavCommunity(
    @Param('communityId') communityId: number,
    @Param('userId') userId: number,
    @User() user: RequestUser,
  ) {
    await this.service.leaveCommunity(communityId, userId, user);
  }
}
