import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/types/RequestWithUser';
import { CommunityService } from './community.service';
import { CommunityAddUser } from './dto/community-add-user.dto';
import { CommunityResponse } from './dto/community-response.dto';

@Controller('api/communities')
export class CommunityController {
  constructor(private readonly service: CommunityService) {}
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
}
