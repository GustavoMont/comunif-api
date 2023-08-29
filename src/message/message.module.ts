import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { CommunityModule } from 'src/community/community.module';
import { PrismaClient } from '@prisma/client';
import { MessageRepository } from './message.repository.service';
import { IMessageRepository } from './interfaces/IMessageRepository';
import { IMessageGateway } from './interfaces/IMessageGateway';
import { IMessageService } from './interfaces/IMessageService';
import { MessageController } from './message.controller';
import { CommunityUsersModule } from 'src/community-users/community-users.module';

@Module({
  imports: [CommunityModule, CommunityUsersModule],
  providers: [
    PrismaClient,
    {
      provide: IMessageGateway,
      useClass: MessageGateway,
    },
    {
      provide: IMessageService,
      useClass: MessageService,
    },
    {
      provide: IMessageRepository,
      useClass: MessageRepository,
    },
  ],
  controllers: [MessageController],
})
export class MessageModule {}
