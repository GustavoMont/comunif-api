import { Injectable } from '@nestjs/common';
import { IMessageRepository } from './interfaces/IMessageRepository';
import { Message } from 'src/models/Message';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { MessageQueryDto } from './dtos/message-query.dto';

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(private readonly db: PrismaClient) {}
  async count({
    communityChannelId,
    from,
    to,
    userId,
  }: MessageQueryDto = {}): Promise<number> {
    return await this.db.message.count({
      where: {
        communityChannelId,
        userId,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    });
  }

  async findById(id: number): Promise<Message> {
    return await this.db.message.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async create(data: Omit<Message, 'user'>): Promise<Message> {
    const { id } = await this.db.message.create({
      data,
    });
    return await this.findById(id);
  }

  async findByChannelId(
    communityChannelId: number,
    { skip, take }: PaginationDto,
  ): Promise<Message[]> {
    return await this.db.message.findMany({
      where: { communityChannelId },
      include: { user: true },
      orderBy: {
        id: 'desc',
      },
      skip,
      take,
    });
  }
}
