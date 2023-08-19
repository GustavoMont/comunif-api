import { PaginationDto } from 'src/dtos/pagination.dto';
import { Message } from 'src/models/Message';

export interface IMessageRepository {
  create(data: Omit<Message, 'user'>): Promise<Message>;
  findById(id: number): Promise<Message>;
  findByChannelId(
    communityChannelId: number,
    pagination: PaginationDto,
  ): Promise<Message[]>;
  countChannelMessages(communityChannelId: number): Promise<number>;
}

export const IMessageRepository = Symbol('IMessageRepository');
