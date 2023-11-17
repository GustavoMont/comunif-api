import { Inject, Injectable } from '@nestjs/common';
import { ICommunityStatisticsService } from './interfaces/ICommunityStatisticsService';
import { ListResponse } from 'src/dtos/list.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { CommunityStatisticsDto } from './dto/community-statistics.dto';
import { ICommunityStatisticsRepository } from './interfaces/ICommunityStatisticsRepository';
import { plainToInstance } from 'class-transformer';
import { BaseStatisticService } from 'src/utils/BaseStatisticService';
import { CountDto } from 'src/dtos/count.dto';
import { ICommunityService } from 'src/community/interfaces/ICommunityService';

@Injectable()
export class CommunityStatisticsService
  extends BaseStatisticService
  implements ICommunityStatisticsService
{
  constructor(
    @Inject(ICommunityStatisticsRepository)
    private readonly repository: ICommunityStatisticsRepository,
    @Inject(ICommunityService)
    private readonly communityService: ICommunityService,
  ) {
    super();
  }
  async communitiesCount(): Promise<CountDto> {
    return await this.communityService.count({ isActive: true });
  }
  async findAll(
    page = 1,
    take = 25,
    filters: StatisticsQueryDto = this.generateDefaultFilters(),
  ): Promise<ListResponse<CommunityStatisticsDto>> {
    const skip = this.generateSkip(page, take);
    const [statistics, total] = await Promise.all([
      this.repository.findAll({ skip, take }, filters),
      this.repository.count(filters),
    ]);
    const communityStatistics = plainToInstance(
      CommunityStatisticsDto,
      statistics,
    );
    return new ListResponse(communityStatistics, total, page, take);
  }
}
