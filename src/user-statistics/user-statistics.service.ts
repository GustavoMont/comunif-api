import { Inject, Injectable } from '@nestjs/common';
import { IUserStatisticsService } from './interfaces/IUserStatisticsService';
import { IUserService } from 'src/user/interfaces/IUserService';
import { ListResponse } from 'src/dtos/list.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { UserStatisticsDto } from './dto/user-statistics.dto';
import { IUserStatisticsRepository } from './interfaces/IUserStatisticsRepository';
import { plainToInstance } from 'class-transformer';
import { BaseStatisticService } from 'src/utils/BaseStatisticService';
import { CountDto } from 'src/dtos/count.dto';

@Injectable()
export class UserStatisticsService
  extends BaseStatisticService
  implements IUserStatisticsService
{
  constructor(
    @Inject(IUserStatisticsRepository)
    private readonly repository: IUserStatisticsRepository,
    @Inject(IUserService) private readonly userService: IUserService,
  ) {
    super();
  }
  async findAll(
    page = 1,
    take = 25,
    filters: StatisticsQueryDto = this.generateDefaultFilters(),
  ): Promise<ListResponse<UserStatisticsDto>> {
    const skip = this.generateSkip(page, take);
    const [userStatistics, total] = await Promise.all([
      this.repository.findAll({ skip, take }, filters),
      this.repository.count(filters),
    ]);
    const statisticsResponse = plainToInstance(
      UserStatisticsDto,
      userStatistics,
    );
    return new ListResponse(statisticsResponse, total, page, take);
  }
  async userCount(): Promise<CountDto> {
    return await this.userService.count({ isActive: true });
  }
}
