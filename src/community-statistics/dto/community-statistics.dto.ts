import { Transform } from 'class-transformer';
import { CommunityStatistics } from 'src/models/CommunityStatistics';
import { UserResponse } from 'src/user/dto/user-response.dto';
import * as moment from 'moment';

export class CommunityStatisticsDto implements CommunityStatistics {
  id: number;
  count: number;
  userId: number | null;
  user: UserResponse | null;
  @Transform(({ value }) => moment(value).format('YYYY-MM-DD'))
  createdAt: Date;
}
