import { CommunityChannel } from '@prisma/client';
import { Community } from 'src/models/Community';

export class CommunityResponse implements Community {
  communityChannels: CommunityChannel[];
  id: number;
  name: string;
  subjectId: number;
}
