import { Transform, plainToInstance } from 'class-transformer';
import { CommunityNestedDto } from 'src/community/dto/community-nested.dto';
import { EvasionReport } from 'src/models/EvasionReport';
import { UserResponse } from 'src/user/dto/user-response.dto';
import { responseDateTransform } from 'src/utils/transforms';

export class EvasionReportResponseDto implements EvasionReport {
  id: number;
  userId: number;
  @Transform(({ value }) => plainToInstance(UserResponse, value))
  user: UserResponse;
  communityId: number;
  @Transform(({ value }) => plainToInstance(CommunityNestedDto, value))
  community: CommunityNestedDto;
  removerId: number | null;
  @Transform(({ value }) => plainToInstance(UserResponse, value))
  remover: UserResponse | null;
  @Transform(responseDateTransform)
  removedAt: Date;
  reason: string | null;
}
