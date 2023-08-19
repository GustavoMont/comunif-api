import { Message as IMessage, User } from '@prisma/client';

export class Message implements IMessage {
  id: number;
  content: string;
  userId: number;
  communityChannelId: number;
  user: User;
}
