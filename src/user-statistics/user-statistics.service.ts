import { Inject, Injectable } from '@nestjs/common';
import { IUserStatisticsService } from './interfaces/IUserStatisticsService';
import { UserCountDto } from '../user/dto/user-count.dto';
import { IUserService } from 'src/user/interfaces/IUserService';
import { ListResponse } from 'src/dtos/list.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { UserStatisticsDto } from './dto/user-statistics.dto';
import { IUserStatisticsRepository } from './interfaces/IUserStatisticsRepository';
import * as moment from 'moment';
import { Service } from 'src/utils/services';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserStatisticsService
  extends Service
  implements IUserStatisticsService
{
  constructor(
    @Inject(IUserStatisticsRepository)
    private readonly repository: IUserStatisticsRepository,
    @Inject(IUserService) private readonly userService: IUserService,
  ) {
    super();
  }
  generateDefaultFilters(): StatisticsQueryDto {
    const format = 'YYYY-MM-DD';
    return {
      from: new Date(moment().subtract(2, 'months').format(format)),
      to: new Date(moment().format(format)),
    };
  }

  async findAll(
    filters: StatisticsQueryDto = this.generateDefaultFilters(),
    page = 1,
    take = 25,
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
  async userCount(): Promise<UserCountDto> {
    return await this.userService.count({ isActive: true });
  }
}
