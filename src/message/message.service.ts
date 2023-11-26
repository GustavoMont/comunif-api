import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IMessageService } from './interfaces/IMessageService';
import { MessagePayload } from './dtos/message-payload.dto';
import { MessageResponse } from './dtos/message-response.dto';
import { plainToInstance } from 'class-transformer';
import { Message } from 'src/models/Message';
import { IMessageRepository } from './interfaces/IMessageRepository';
import { ListResponse } from 'src/dtos/list.dto';
import { Service } from 'src/utils/services';
import { RequestUser } from 'src/types/RequestUser';
import { ICommunityService } from 'src/community/interfaces/ICommunityService';
import { ICommunityUsersService } from 'src/community-users/interfaces/ICommunityUsersService';
import { RoleEnum } from 'src/models/User';
import { MessageQueryDto } from './dtos/message-query.dto';

@Injectable()
export class MessageService extends Service implements IMessageService {
  constructor(
    @Inject(IMessageRepository) private readonly repository: IMessageRepository,
    @Inject(ICommunityService)
    private readonly communityService: ICommunityService,
    @Inject(ICommunityUsersService)
    private readonly communityUsersService: ICommunityUsersService,
  ) {
    super();
  }

  async countMessages(filters: MessageQueryDto = {}): Promise<number> {
    const total = await this.repository.count(filters);
    return total;
  }

  async create(payload: MessagePayload): Promise<MessageResponse> {
    const messageData = plainToInstance(Message, payload);
    const newMessage = await this.repository.create(messageData);
    return plainToInstance(MessageResponse, newMessage);
  }
  async findByChannelId(
    communityChannelId: number,
    user: RequestUser | 'socket',
    page = 1,
    take = 50,
  ): Promise<ListResponse<MessageResponse>> {
    if (user !== 'socket' && !user.roles.includes(RoleEnum.admin)) {
      const community = await this.communityService.findByChannelId(
        communityChannelId,
      );
      const isUserInCommunity =
        await this.communityUsersService.isUserInCommunity(
          user.id,
          community.id,
        );
      if (!isUserInCommunity) {
        throw new HttpException(
          'Você não pode mandar mensagem pra essa comunidade',
          HttpStatus.FORBIDDEN,
        );
      }
    }
    const skip = this.generateSkip(page, take);
    const [messages, count] = await Promise.all([
      this.repository.findByChannelId(communityChannelId, { skip, take }),
      this.repository.count({ communityChannelId }),
    ]);
    const messagesResponses = plainToInstance(MessageResponse, messages);
    return new ListResponse<MessageResponse>(
      messagesResponses,
      count,
      page,
      take,
    );
  }
}
