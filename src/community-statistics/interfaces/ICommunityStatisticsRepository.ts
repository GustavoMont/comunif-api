import { CreateStatisticsDto } from 'src/dtos/create-statistics.dto';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { CommunityStatistics } from 'src/models/CommunityStatistics';

export interface ICommunityStatisticsRepository {
  findAll(
    pagination: PaginationDto,
    filters?: StatisticsQueryDto,
  ): Promise<CommunityStatistics[]>;
  count(filters?: StatisticsQueryDto): Promise<number>;
  create(data: CreateStatisticsDto): Promise<CommunityStatistics>;
}

export const ICommunityStatisticsRepository = Symbol(
  'ICommunityStatisticsRepository',
);
