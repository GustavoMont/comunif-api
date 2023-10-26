import { UserStatistics } from 'src/models/UserStatistics';
import { UserResponse } from 'src/user/dto/user-response.dto';

export class UserStatisticsDto implements UserStatistics {
  id: number;
  count: number;
  createdAt: Date;
  userId: number | null;
  user: UserResponse | null;
}
