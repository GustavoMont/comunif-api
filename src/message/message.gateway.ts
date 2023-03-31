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

@WebSocketGateway()
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messageService: MessageService) {}
  private logger: Logger = new Logger('MessageLogger');
  afterInit() {
    this.logger.log(`Tamo no ar`);
  }
  handleConnection(client: Socket) {
    this.server.emit('msgToClient', 'a');
    this.logger.log(`Usuário ${client.id} conectado`);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Usuário ${client.id} saiu`);
  }
  @WebSocketServer() server: Server;

  @SubscribeMessage('messageToServer')
  handleMessage(client: Socket, payload: any) {
    console.log(payload);

    this.server.emit('msgToClient', payload, client.id);
  }
}
