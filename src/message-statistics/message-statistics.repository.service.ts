import { Injectable } from '@nestjs/common';
import { IMessageStatisticsRepository } from './interfaces/IMessageStatisticsRepository';
import { CreateStatisticsDto } from 'src/dtos/create-statistics.dto';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { MessageStatistics } from 'src/models/MessageStatistics';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MessageStatisticsRepository
  implements IMessageStatisticsRepository
{
  constructor(private readonly db: PrismaClient) {}
  async create(data: CreateStatisticsDto): Promise<MessageStatistics> {
    return await this.db.messageStatistics.create({
      data,
      include: { user: true },
    });
  }
  async findAll(
    { skip, take }: PaginationDto,
    { from, to }: StatisticsQueryDto = {},
  ): Promise<MessageStatistics[]> {
    return await this.db.messageStatistics.findMany({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      include: { user: true },
      skip,
      take,
    });
  }
  async count({ from, to }: StatisticsQueryDto = {}): Promise<number> {
    return await this.db.messageStatistics.count({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    });
  }
}
