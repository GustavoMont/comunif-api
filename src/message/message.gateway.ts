import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageService } from './message.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Message } from '@prisma/client';
import { CommunityService } from 'src/community/community.service';

@WebSocketGateway()
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('MessageLogger');
  constructor(
    private readonly messageService: MessageService,
    private communityService: CommunityService,
  ) {}
  @WebSocketServer() server: Server;

  afterInit() {
    this.logger.log(`Tamo no ar`);
  }
  handleConnection(client: Socket) {
    this.logger.log(`Usuário ${client.id} conectado`);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Usuário ${client.id} saiu`);
  }

  @SubscribeMessage('joinRooms')
  async joinRooms(client: Socket, { userId }: { userId: number }) {
    const communities = await this.communityService.findUserCommunities(userId);
    communities.forEach(({ communityChannels }) => {
      communityChannels.forEach(({ id }) => client.join(`channel${id}`));
    });
  }

  @SubscribeMessage('messageToCommunity')
  chat(client: Socket, payload: Message) {
    const { communityChannelId: room, content } = payload;
    this.server.to(`${room}`).emit('message', content);
  }

  @SubscribeMessage('messageToServer')
  handleMessage(client: Socket, payload: any) {
    console.log(payload);

    this.server.emit('msgToClient', payload, client.id);
  }
}
