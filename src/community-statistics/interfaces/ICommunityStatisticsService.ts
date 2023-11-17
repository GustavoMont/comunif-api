import { ListResponse } from 'src/dtos/list.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { CommunityStatisticsDto } from '../dto/community-statistics.dto';
import { CountDto } from 'src/dtos/count.dto';

export interface ICommunityStatisticsService {
  findAll(
    page: number,
    take: number,
    filters?: StatisticsQueryDto,
  ): Promise<ListResponse<CommunityStatisticsDto>>;
  communitiesCount(): Promise<CountDto>;
}

export const ICommunityStatisticsService = Symbol(
  'ICommunityStatisticsService',
);
