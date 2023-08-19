import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { CommunityModule } from 'src/community/community.module';
import { PrismaClient } from '@prisma/client';
import { MessageRepository } from './message.repository.service';
import { IMessageRepository } from './interfaces/IMessageRepository';
import { IMessageGateway } from './interfaces/IMessageGatewat';
import { IMessageService } from './interfaces/IMessageService';

@Module({
  imports: [CommunityModule],
  providers: [
    {
      provide: IMessageGateway,
      useClass: MessageGateway,
    },
    {
      provide: IMessageService,
      useClass: MessageService,
    },
    PrismaClient,
    {
      provide: IMessageRepository,
      useClass: MessageRepository,
    },
  ],
})
export class MessageModule {}
