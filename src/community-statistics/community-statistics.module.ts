import { Module } from '@nestjs/common';
import { CommunityStatisticsService } from './community-statistics.service';
import { PrismaClient } from '@prisma/client';
import { ICommunityStatisticsRepository } from './interfaces/ICommunityStatisticsRepository';
import { CommunityStatisticsRepository } from './community-statistics.repository.service';
import { CommunityStatisticsController } from './community-statistics.controller';
import { CommunityModule } from 'src/community/community.module';
import { ICommunityStatisticsService } from './interfaces/ICommunityStatisticsService';

@Module({
  providers: [
    CommunityStatisticsService,
    PrismaClient,
    {
      provide: ICommunityStatisticsRepository,
      useClass: CommunityStatisticsRepository,
    },
    {
      provide: ICommunityStatisticsService,
      useClass: CommunityStatisticsService,
    },
  ],
  controllers: [CommunityStatisticsController],
  imports: [CommunityModule],
})
export class CommunityStatisticsModule {}
