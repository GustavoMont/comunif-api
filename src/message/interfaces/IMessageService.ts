import { ListResponse } from 'src/dtos/list.dto';
import { MessagePayload } from '../dtos/message-payload.dto';
import { MessageResponse } from '../dtos/message-response.dto';
import { RequestUser } from 'src/types/RequestUser';

export interface IMessageService {
  create(payload: MessagePayload): Promise<MessageResponse>;
  findByChannelId(
    communityChannelId: number,
    user: RequestUser | 'socket',
    page?: number,
    take?: number,
  ): Promise<ListResponse<MessageResponse>>;
}

export const IMessageService = Symbol('IMessageService');
