import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { ListResponse } from 'src/dtos/list.dto';
import { UserStatisticsDto } from '../dto/user-statistics.dto';
import { CountDto } from 'src/dtos/count.dto';
import { RequestUser } from 'src/types/RequestUser';

export interface IUserStatisticsService {
  userCount(): Promise<CountDto>;
  findAll(
    page: number,
    take: number,
    filters?: StatisticsQueryDto,
  ): Promise<ListResponse<UserStatisticsDto>>;
  create(user?: RequestUser): Promise<UserStatisticsDto>;
}

export const IUserStatisticsService = Symbol('IUserStatisticsService');
