import { ListResponse } from 'src/dtos/list.dto';
import { MessagePayload } from '../dtos/message-payload.dto';
import { MessageResponse } from '../dtos/message-response.dto';
import { RequestUser } from 'src/types/RequestUser';
import { MessageQueryDto } from '../dtos/message-query.dto';

export interface IMessageService {
  create(payload: MessagePayload): Promise<MessageResponse>;
  findByChannelId(
    communityChannelId: number,
    user: RequestUser | 'socket',
    page?: number,
    take?: number,
  ): Promise<ListResponse<MessageResponse>>;
  countMessages(filters?: MessageQueryDto): Promise<number>;
}

export const IMessageService = Symbol('IMessageService');
