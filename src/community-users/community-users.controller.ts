import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommunityAddUser } from 'src/community/dto/community-add-user.dto';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { RequestWithUser } from 'src/types/RequestWithUser';
import { ICommunityUsersService } from './interfaces/ICommunityUsersService';

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
}
