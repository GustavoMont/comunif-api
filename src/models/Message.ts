import { Message as IMessage, User } from '@prisma/client';

export class Message implements IMessage {
  createdAt: Date;
  id: number;
  content: string;
  userId: number;
  communityChannelId: number;
  user: User;
}
