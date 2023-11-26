import { Module } from '@nestjs/common';
import { UserStatisticsService } from './user-statistics.service';
import { IUserStatisticsService } from './interfaces/IUserStatisticsService';
import { UserModule } from 'src/user/user.module';
import { UserStatisticsController } from './user-statistics.controller';
import { IUserStatisticsRepository } from './interfaces/IUserStatisticsRepository';
import { UserStatisticsRepository } from './user-statistics.repository.service';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [
    PrismaClient,
    {
      provide: IUserStatisticsService,
      useClass: UserStatisticsService,
    },
    {
      provide: IUserStatisticsRepository,
      useClass: UserStatisticsRepository,
    },
  ],
  imports: [UserModule],
  controllers: [UserStatisticsController],
  exports: [IUserStatisticsService],
})
export class UserStatisticsModule {}
