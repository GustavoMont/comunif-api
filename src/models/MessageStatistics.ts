import {
  MessageStatistics as MessageStatisticsType,
  User,
} from '@prisma/client';

export class MessageStatistics implements MessageStatisticsType {
  id: number;
  count: number;
  userId: number | null;
  createdAt: Date;
  user: User | null;
}
