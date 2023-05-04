import { Injectable, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<string>>
{
  async transform(image?: Express.Multer.File): Promise<string> {
    if (image) {
      const { path } = image;
      await sharp(path).resize(800).webp({ effort: 3 });

      return path;
    }

    return null;
  }
}
