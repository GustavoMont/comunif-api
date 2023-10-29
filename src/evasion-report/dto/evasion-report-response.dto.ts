import { Transform } from 'class-transformer';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { EvasionReport } from 'src/models/EvasionReport';
import { UserResponse } from 'src/user/dto/user-response.dto';
import { responseDateTransform } from 'src/utils/transforms';

export class EvasionReportResponseDto implements EvasionReport {
  id: number;
  userId: number;
  user: UserResponse;
  communityId: number;
  community: CommunityResponse;
  removerId: number | null;
  remover: UserResponse | null;
  @Transform(responseDateTransform)
  removedAt: Date;
  reason: string | null;
}
