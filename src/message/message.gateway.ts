import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger } from '@nestjs/common';
import { IMessageGateway } from './interfaces/IMessageGateway';
import { MessagePayload } from './dtos/message-payload.dto';
import { IMessageService } from './interfaces/IMessageService';
import { JoinChannelDto } from './dtos/join-channel.dto';
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
  },
})
export class MessageGateway implements IMessageGateway {
  private logger: Logger = new Logger('MessageLogger');
  constructor(
    @Inject(IMessageService) private readonly service: IMessageService,
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

  @SubscribeMessage('message-channel')
  async onMessageChannel(
    client: Socket,
    payload: MessagePayload,
  ): Promise<void> {
    const room = payload.communityChannelId.toString();
    client.join(room);
    const message = await this.service.create(payload);
    this.server.to(room).emit('message-channel', message);
  }
  @SubscribeMessage('join-channel')
  async onJoinChannel(client: Socket, payload: JoinChannelDto): Promise<void> {
    client.join(payload.communityChannelId.toString());
  }
}
