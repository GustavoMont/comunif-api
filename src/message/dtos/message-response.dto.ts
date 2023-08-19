import { Message } from 'src/models/Message';
import { UserResponse } from 'src/user/dto/user-response.dto';

export class MessageResponse implements Message {
  id: number;
  content: string;
  userId: number;
  communityChannelId: number;
  user: UserResponse;
}
