import { Injectable, PipeTransform } from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';
import { avatarPath } from 'src/config/image-paths';

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<string>>
{
  async transform(image: Express.Multer.File): Promise<string> {
    const filename = `${image.filename}-avatar.webp`;
    await sharp(image.path)
      .resize(800)
      .webp({ effort: 3 })
      .toFile(path.join(avatarPath, filename));

    return filename;
  }
}
