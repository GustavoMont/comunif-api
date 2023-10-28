import { Module } from '@nestjs/common';
import { CommunityStatisticsService } from './community-statistics.service';
import { PrismaClient } from '@prisma/client';
import { ICommunityStatisticsRepository } from './interfaces/ICommunityStatisticsRepository';
import { CommunityStatisticsRepository } from './community-statistics.repository.service';

@Module({
  providers: [
    CommunityStatisticsService,
    PrismaClient,
    {
      provide: ICommunityStatisticsRepository,
      useClass: CommunityStatisticsRepository,
    },
  ],
})
export class CommunityStatisticsModule {}
