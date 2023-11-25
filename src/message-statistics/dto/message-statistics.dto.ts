import { Transform, plainToInstance } from 'class-transformer';
import { MessageStatistics } from 'src/models/MessageStatistics';
import { UserResponse } from 'src/user/dto/user-response.dto';
import { responseDateTransform } from 'src/utils/transforms';

export class MessageStatisticsDto implements MessageStatistics {
  id: number;
  count: number;
  userId: number | null;
  @Transform(responseDateTransform)
  createdAt: Date;
  @Transform(({ value }) => plainToInstance(UserResponse, value))
  user: UserResponse | null;
}
