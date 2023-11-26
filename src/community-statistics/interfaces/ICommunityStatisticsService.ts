import { ListResponse } from 'src/dtos/list.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { CommunityStatisticsDto } from '../dto/community-statistics.dto';
import { CountDto } from 'src/dtos/count.dto';
import { RequestUser } from 'src/types/RequestUser';

export interface ICommunityStatisticsService {
  findAll(
    page: number,
    take: number,
    filters?: StatisticsQueryDto,
  ): Promise<ListResponse<CommunityStatisticsDto>>;
  communitiesCount(): Promise<CountDto>;
  create(user?: RequestUser): Promise<CommunityStatisticsDto>;
}

export const ICommunityStatisticsService = Symbol(
  'ICommunityStatisticsService',
);
