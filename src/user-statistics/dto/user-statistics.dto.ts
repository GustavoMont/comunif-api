import { Transform } from 'class-transformer';
import { UserStatistics } from 'src/models/UserStatistics';
import { UserResponse } from 'src/user/dto/user-response.dto';
import * as moment from 'moment';
export class UserStatisticsDto implements UserStatistics {
  id: number;
  count: number;
  @Transform(({ value }) => moment(value).format('YYYY-MM-DD'))
  createdAt: Date;
  userId: number | null;
  @Transform(({ value }) => value ?? null)
  user: UserResponse | null;
}
