import { Injectable, PipeTransform } from '@nestjs/common';
import { UserUpdate } from '../dto/user-update.dto';

@Injectable()
export class UserUpdatePipe
  implements PipeTransform<string, Promise<UserUpdate>>
{
  async transform(filename: string): Promise<UserUpdate> {
    const updates = new UserUpdate();
    updates.avatar = filename;
    return updates;
  }
}
