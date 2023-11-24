import { PaginationDto } from 'src/dtos/pagination.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { UserStatistics } from 'src/models/UserStatistics';
import { CreateUserStatisticsDto } from '../dto/create-user-statistics.dto';

export interface IUserStatisticsRepository {
  findAll(
    pagination: PaginationDto,
    filter?: StatisticsQueryDto,
  ): Promise<UserStatistics[]>;
  count(filter?: StatisticsQueryDto): Promise<number>;
  create(userStatistic: CreateUserStatisticsDto): Promise<UserStatistics>;
}

export const IUserStatisticsRepository = Symbol('IUserStatisticsRepository');
