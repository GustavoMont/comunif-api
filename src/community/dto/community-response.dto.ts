import { Community } from '@prisma/client';

export class CommunityResponse implements Community {
  id: number;
  name: string;
  subjectId: number;
}
