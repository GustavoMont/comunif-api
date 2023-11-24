import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { IUserStatisticsService } from './interfaces/IUserStatisticsService';
import { IUserService } from 'src/user/interfaces/IUserService';
import { ListResponse } from 'src/dtos/list.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { UserStatisticsDto } from './dto/user-statistics.dto';
import { IUserStatisticsRepository } from './interfaces/IUserStatisticsRepository';
import { plainToInstance } from 'class-transformer';
import { BaseStatisticService } from 'src/utils/BaseStatisticService';
import { CountDto } from 'src/dtos/count.dto';
import { RequestUser } from 'src/types/RequestUser';
import * as moment from 'moment';
import { Cron } from '@nestjs/schedule';
import { statisticsTasksConstants } from 'src/constants/scheduled-tasks.constants';

@Injectable()
export class UserStatisticsService
  extends BaseStatisticService
  implements IUserStatisticsService
{
  private logger: Logger = new Logger('UserStatistics');
  constructor(
    @Inject(IUserStatisticsRepository)
    private readonly repository: IUserStatisticsRepository,
    @Inject(IUserService) private readonly userService: IUserService,
  ) {
    super();
  }

  @Cron(statisticsTasksConstants.interval)
  async create(user?: RequestUser): Promise<UserStatisticsDto> {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();
    const monthStatisticsCount = await this.repository.count({
      from: startOfMonth,
      to: endOfMonth,
    });
    if (monthStatisticsCount > 0) {
      this.logger.error('Statistics already created');
      throw new HttpException(
        'As estatísticas desse mês já foram geradas',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { total: count } = await this.userService.count({ isActive: true });
    const userStatistics = await this.repository.create({
      count,
      userId: user?.id,
    });
    this.logger.log('User statistics created');
    return plainToInstance(UserStatisticsDto, userStatistics);
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
