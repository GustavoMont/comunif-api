import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ICommunityStatisticsService } from 'src/community-statistics/interfaces/ICommunityStatisticsService';
import { statisticsTasksConstants } from 'src/constants/scheduled-tasks.constants';
import { IMessageStatisticsService } from 'src/message-statistics/interfaces/IMessageStatisticsService';
import { IUserStatisticsService } from 'src/user-statistics/interfaces/IUserStatisticsService';

@Injectable()
export class StatisticsService {
  constructor(
    @Inject(IUserStatisticsService)
    private readonly userStatisticsServices: IUserStatisticsService,
    @Inject(ICommunityStatisticsService)
    private readonly communityStatisticsServices: ICommunityStatisticsService,
    @Inject(IMessageStatisticsService)
    private readonly messageStatisticsServices: ICommunityStatisticsService,
  ) {}

  @Cron(statisticsTasksConstants.interval)
  async saveStatistics() {
    await Promise.all([
      this.userStatisticsServices.create(),
      this.communityStatisticsServices.create(),
      this.messageStatisticsServices.create(),
    ]);
  }
}
