import {
  CommunityStatistics as CommunityStatisticsType,
  User,
} from '@prisma/client';

export class CommunityStatistics implements CommunityStatisticsType {
  id: number;
  count: number;
  userId: number | null;
  user: User | null;
  createdAt: Date;
}
