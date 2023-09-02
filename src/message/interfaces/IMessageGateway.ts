import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessagePayload } from '../dtos/message-payload.dto';
import { JoinChannelDto } from '../dtos/join-channel.dto';

export interface IMessageGateway
  extends OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect {
  onMessageChannel(client: Socket, payload: MessagePayload): Promise<void>;
  onJoinChannel(client: Socket, payload: JoinChannelDto): Promise<void>;
}

export const IMessageGateway = Symbol('IMessageGateway');
