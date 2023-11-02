import { CommunityChannel } from '@prisma/client';
import { Transform, Expose, Exclude } from 'class-transformer';
import { Community } from 'src/models/Community';

export class CommunityNestedDto implements Community {
  adminId: number;
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
  subject: string;
  @Exclude()
  isMember: boolean;
}
