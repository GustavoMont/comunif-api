import {
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IMessageService } from './interfaces/IMessageService';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ParseIntUndefinedPipe } from 'src/pipes/parse-int-undefined.pipe';
import { ListResponse } from 'src/dtos/list.dto';
import { MessageResponse } from './dtos/message-response.dto';
import { User } from 'src/decorators/request-user.decorator';
import { RequestUser } from 'src/types/RequestUser';

@Controller('/api/messages')
export class MessageController {
  constructor(
    @Inject(IMessageService) private readonly service: IMessageService,
  ) {}

  @Get('/channel/:communityChannelId')
  @UseGuards(JwtAuthGuard)
  async findCommunityMessages(
    @Param('communityChannelId', ParseIntPipe) communityChannelId: number,
    @Query('take', ParseIntUndefinedPipe) take: number,
    @Query('page', ParseIntUndefinedPipe) page: number,
    @User() user: RequestUser,
  ): Promise<ListResponse<MessageResponse>> {
    return await this.service.findByChannelId(
      communityChannelId,
      user,
      page,
      take,
    );
  }
}
