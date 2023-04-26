import { CommunityChannel, Community as CommunityType } from '@prisma/client';

export class Community implements CommunityType {
  banner: string;
  isActive: boolean;
  id: number;
  name: string;
  subjectId: number;
  communityChannels: CommunityChannel[];
}
