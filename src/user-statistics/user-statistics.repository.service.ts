import { Injectable } from '@nestjs/common';
import { IUserStatisticsRepository } from './interfaces/IUserStatisticsRepository';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { UserStatistics } from 'src/models/UserStatistics';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { CreateStatisticsDto } from '../dtos/create-statistics.dto';

@Injectable()
export class UserStatisticsRepository implements IUserStatisticsRepository {
  constructor(private readonly db: PrismaClient) {}
  async create(data: CreateStatisticsDto): Promise<UserStatistics> {
    return await this.db.userStatistics.create({
      data,
      include: { user: true },
    });
  }
  async findAll(
    { skip, take }: PaginationDto,
    { from, to }: StatisticsQueryDto = {},
  ): Promise<UserStatistics[]> {
    return await this.db.userStatistics.findMany({
      include: { user: true },
      where: {
        createdAt: { gte: from, lte: to },
      },
      skip,
      take,
    });
  }
  async count({ from, to }: StatisticsQueryDto = {}): Promise<number> {
    return await this.db.userStatistics.count({
      where: {
        createdAt: { gte: from, lte: to },
      },
    });
  }
}
