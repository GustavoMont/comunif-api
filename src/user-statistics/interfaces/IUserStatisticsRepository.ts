import { PaginationDto } from 'src/dtos/pagination.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { UserStatistics } from 'src/models/UserStatistics';

export interface IUserStatisticsRepository {
  findAll(
    pagination: PaginationDto,
    filter?: StatisticsQueryDto,
  ): Promise<UserStatistics[]>;
  count(filter?: StatisticsQueryDto): Promise<number>;
}

export const IUserStatisticsRepository = Symbol('IUserStatisticsRepository');
