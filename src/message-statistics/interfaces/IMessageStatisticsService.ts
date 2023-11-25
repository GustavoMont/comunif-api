import { RequestUser } from 'src/types/RequestUser';
import { MessageStatisticsDto } from '../dto/message-statistics.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { ListResponse } from 'src/dtos/list.dto';
import { CountDto } from 'src/dtos/count.dto';

export interface IMessageStatisticsService {
  create(user?: RequestUser): Promise<MessageStatisticsDto>;
  findAll(
    page: number,
    take: number,
    filters?: StatisticsQueryDto,
  ): Promise<ListResponse<MessageStatisticsDto>>;
  countMessages(): Promise<CountDto>;
}

export const IMessageStatisticsService = Symbol('IMessageStatisticsService');
