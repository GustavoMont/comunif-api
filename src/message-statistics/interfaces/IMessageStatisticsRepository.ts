import { CreateStatisticsDto } from 'src/dtos/create-statistics.dto';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { MessageStatistics } from 'src/models/MessageStatistics';

export interface IMessageStatisticsRepository {
  create(data: CreateStatisticsDto): Promise<MessageStatistics>;
  findAll(
    pagination: PaginationDto,
    filters?: StatisticsQueryDto,
  ): Promise<MessageStatistics[]>;
  count(filters?: StatisticsQueryDto): Promise<number>;
}

export const IMessageStatisticsRepository = Symbol(
  'IMessageStatisticsRepository',
);
