import { PaginationDto } from 'src/dtos/pagination.dto';
import { Message } from 'src/models/Message';
import { MessageQueryDto } from '../dtos/message-query.dto';

export interface IMessageRepository {
  create(data: Omit<Message, 'user'>): Promise<Message>;
  findById(id: number): Promise<Message>;
  findByChannelId(
    communityChannelId: number,
    pagination: PaginationDto,
  ): Promise<Message[]>;
  count(filters?: MessageQueryDto): Promise<number>;
}

export const IMessageRepository = Symbol('IMessageRepository');
