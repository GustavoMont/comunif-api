import { CommunityChannel } from '@prisma/client';
import { Transform, Expose } from 'class-transformer';
import { Community } from 'src/models/Community';

export class CommunityResponse implements Community {
  @Transform(({ value }) => value || null, { toClassOnly: true })
  @Expose()
  banner: string | null;
  @Transform(({ value }) => (typeof value === 'undefined' ? false : value))
  @Expose()
  isActive: boolean;
  @Transform(({ value }) => value || [])
  communityChannels: CommunityChannel[];
  id: number;
  name: string;
  subjectId: number;
}
