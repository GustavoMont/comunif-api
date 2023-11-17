import { Transform } from 'class-transformer';
import { CommunityStatistics } from 'src/models/CommunityStatistics';
import { UserResponse } from 'src/user/dto/user-response.dto';
import { responseDateTransform } from 'src/utils/transforms';

export class CommunityStatisticsDto implements CommunityStatistics {
  id: number;
  count: number;
  userId: number | null;
  user: UserResponse | null;
  @Transform(responseDateTransform)
  createdAt: Date;
}
