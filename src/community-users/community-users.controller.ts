import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommunityAddUser } from 'src/community/dto/community-add-user.dto';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { RequestWithUser } from 'src/types/RequestWithUser';
import { ICommunityUsersService } from './interfaces/ICommunityUsersService';
import { ParseIntUndefinedPipe } from 'src/pipes/parse-int-undefined.pipe';

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
    @Req() req: RequestWithUser,
  ): Promise<CommunityResponse> {
    return await this.service.addUser(body.communityId, req.user.id);
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
}
