import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { CommunityModule } from 'src/community/community.module';

@Module({
  imports: [CommunityModule],
  providers: [MessageGateway, MessageService],
})
export class MessageModule {}
