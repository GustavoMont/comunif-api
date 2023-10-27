import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { UserCountDto } from '../../user/dto/user-count.dto';
import { ListResponse } from 'src/dtos/list.dto';
import { UserStatisticsDto } from '../dto/user-statistics.dto';

export interface IUserStatisticsService {
  userCount(): Promise<UserCountDto>;
  findAll(
    page: number,
    take: number,
    filters?: StatisticsQueryDto,
  ): Promise<ListResponse<UserStatisticsDto>>;
}

export const IUserStatisticsService = Symbol('IUserStatisticsService');
