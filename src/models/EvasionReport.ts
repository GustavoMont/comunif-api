import { EvasionReport as EvasionReportType, User } from '@prisma/client';
import { Community } from './Community';

export class EvasionReport implements EvasionReportType {
  id: number;
  userId: number;
  user: User;
  communityId: number | null;
  community: Community;
  removerId: number | null;
  remover: User | null;
  removedAt: Date;
  reason: string | null;
}
