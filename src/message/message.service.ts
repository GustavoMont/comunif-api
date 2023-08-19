import { Inject, Injectable } from '@nestjs/common';
import { IMessageService } from './interfaces/IMessageService';
import { MessagePayload } from './dtos/message-payload.dto';
import { MessageResponse } from './dtos/message-response.dto';
import { plainToInstance } from 'class-transformer';
import { Message } from 'src/models/Message';
import { IMessageRepository } from './interfaces/IMessageRepository';
import { ListResponse } from 'src/dtos/list.dto';
import { Service } from 'src/utils/services';

@Injectable()
export class MessageService extends Service implements IMessageService {
  constructor(
    @Inject(IMessageRepository) private readonly repository: IMessageRepository,
  ) {
    super();
  }

  async create(payload: MessagePayload): Promise<MessageResponse> {
    const messageData = plainToInstance(Message, payload);
    const newMessage = await this.repository.create(messageData);
    return plainToInstance(MessageResponse, newMessage);
  }
  async findByChannelId(
    communityChannelId: number,
    page = 1,
    take = 50,
  ): Promise<ListResponse<MessageResponse>> {
    const skip = this.generateSkip(page, take);
    const [messages, count] = await Promise.all([
      this.repository.findByChannelId(communityChannelId, { skip, take }),
      this.repository.countChannelMessages(communityChannelId),
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
