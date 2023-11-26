import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ICommunityStatisticsService } from './interfaces/ICommunityStatisticsService';
import { ListResponse } from 'src/dtos/list.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { CommunityStatisticsDto } from './dto/community-statistics.dto';
import { ICommunityStatisticsRepository } from './interfaces/ICommunityStatisticsRepository';
import { plainToInstance } from 'class-transformer';
import { BaseStatisticService } from 'src/utils/BaseStatisticService';
import { CountDto } from 'src/dtos/count.dto';
import { ICommunityService } from 'src/community/interfaces/ICommunityService';
import { RequestUser } from 'src/types/RequestUser';

@Injectable()
export class CommunityStatisticsService
  extends BaseStatisticService
  implements ICommunityStatisticsService
{
  private readonly logger = new Logger(CommunityStatisticsService.name);
  constructor(
    @Inject(ICommunityStatisticsRepository)
    private readonly repository: ICommunityStatisticsRepository,
    @Inject(ICommunityService)
    private readonly communityService: ICommunityService,
  ) {
    super();
  }

  async create(user?: RequestUser): Promise<CommunityStatisticsDto> {
    const { firstDay: from, lastDay: to } = this.getMonthRange();
    const count = await this.repository.count({ from, to });
    if (count > 0) {
      this.logger.error('Community statistics altready exists');
      throw new HttpException(
        'As estatísticas desse mês já foram geradas',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { total } = await this.communitiesCount();
    const communityStatistics = await this.repository.create({
      count: total,
      userId: user?.id,
    });
    this.logger.log('Community statistics was created successfuly');
    return plainToInstance(CommunityStatisticsDto, communityStatistics);
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
