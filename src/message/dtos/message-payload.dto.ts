import { IsNotEmpty } from 'class-validator';
import { IsNaN } from 'src/decorators/is-nan.decorator';
import { Message } from 'src/models/Message';

export class MessagePayload
  implements Pick<Message, 'content' | 'userId' | 'communityChannelId'>
{
  @IsNotEmpty()
  content: string;
  @IsNaN()
  communityChannelId: number;
  @IsNaN()
  userId: number;
}
