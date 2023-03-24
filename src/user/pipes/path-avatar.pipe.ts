import { Injectable, PipeTransform } from '@nestjs/common';
import { avatarPath } from 'src/config/image-paths';
import { UserUpdate } from '../dto/user-update.dto';

@Injectable()
export class PathPipe implements PipeTransform<string, Promise<UserUpdate>> {
  async transform(filename: string): Promise<UserUpdate> {
    const updates = new UserUpdate();
    updates.avatar = `public/${avatarPath.replace('uploads/', '')}/${filename}`;
    return updates;
  }
}
