import { PaginationDto } from 'src/dtos/pagination.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { UserStatistics } from 'src/models/UserStatistics';
import { CreateStatisticsDto } from '../../dtos/create-statistics.dto';

export interface IUserStatisticsRepository {
  findAll(
    pagination: PaginationDto,
    filter?: StatisticsQueryDto,
  ): Promise<UserStatistics[]>;
  count(filter?: StatisticsQueryDto): Promise<number>;
  create(userStatistic: CreateStatisticsDto): Promise<UserStatistics>;
}

export const IUserStatisticsRepository = Symbol('IUserStatisticsRepository');
