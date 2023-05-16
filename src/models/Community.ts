import { CommunityChannel, Community as CommunityType } from '@prisma/client';

export class Community implements CommunityType {
  banner: string | null;
  isActive: boolean;
  id: number;
  name: string;
  subject: string;
  communityChannels: CommunityChannel[];
}
