import { UserStatistics as UserStatisticsType, User } from '@prisma/client';

export class UserStatistics implements UserStatisticsType {
  id: number;
  count: number;
  userId: number | null;
  user: User | null;
  createdAt: Date;
}
