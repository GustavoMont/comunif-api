import { Module } from '@nestjs/common';
import { MessageStatisticsService } from './message-statistics.service';
import { IMessageStatisticsService } from './interfaces/IMessageStatisticsService';
import { IMessageStatisticsRepository } from './interfaces/IMessageStatisticsRepository';
import { MessageStatisticsRepository } from './message-statistics.repository.service';
import { MessageStatisticsController } from './message-statistics.controller';
import { MessageModule } from 'src/message/message.module';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [
    PrismaClient,
    {
      provide: IMessageStatisticsService,
      useClass: MessageStatisticsService,
    },
    {
      provide: IMessageStatisticsRepository,
      useClass: MessageStatisticsRepository,
    },
  ],
  controllers: [MessageStatisticsController],
  imports: [MessageModule],
  exports: [IMessageStatisticsService],
})
export class MessageStatisticsModule {}
