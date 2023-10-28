import { Injectable } from '@nestjs/common';
import { ICommunityStatisticsRepository } from './interfaces/ICommunityStatisticsRepository';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { CommunityStatistics } from 'src/models/CommunityStatistics';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/dtos/pagination.dto';

@Injectable()
export class CommunityStatisticsRepository
  implements ICommunityStatisticsRepository
{
  constructor(private readonly db: PrismaClient) {}
  async findAll(
    { skip, take }: PaginationDto = { skip: 0, take: 25 },
    { from, to }: StatisticsQueryDto = {},
  ): Promise<CommunityStatistics[]> {
    return await this.db.communityStatistics.findMany({
      include: { user: true },
      where: { createdAt: { gte: from, lte: to } },
      skip,
      take,
    });
  }
  async count({ from, to }: StatisticsQueryDto = {}): Promise<number> {
    return await this.db.communityStatistics.count({
      where: { createdAt: { gte: from, lte: to } },
    });
  }
}
