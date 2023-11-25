import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { UserStatisticsModule } from 'src/user-statistics/user-statistics.module';
import { CommunityStatisticsModule } from 'src/community-statistics/community-statistics.module';

@Module({
  providers: [StatisticsService],
  imports: [UserStatisticsModule, CommunityStatisticsModule],
})
export class StatisticsModule {}
