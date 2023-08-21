import { Injectable, Logger } from '@nestjs/common';
import { env } from 'src/constants/env';
import { unlink } from 'fs/promises';

@Injectable()
export class ImageService {
  private logger: Logger = new Logger('MessageLogger');
  private getImagePath(banner: string) {
    return banner.replace(/public/gi, '').replace(new RegExp(env.domain), '');
  }
  public async deleteImage(banner: string): Promise<void> {
    try {
      const path = this.getImagePath(banner);
      await unlink(`uploads/${path}`);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
