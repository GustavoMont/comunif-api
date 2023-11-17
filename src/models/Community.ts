import { CommunityChannel, Community as CommunityType } from '@prisma/client';

export class Community implements CommunityType {
  id: number;
  name: string;
  subject: string;
  banner: string | null;
  isActive: boolean;
  adminId: number | null;
  communityChannels: CommunityChannel[];
}
