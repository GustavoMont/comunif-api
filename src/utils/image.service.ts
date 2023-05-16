import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';

@Injectable()
export class ImageService {
  public async deleteImage(path: string): Promise<void> {
    try {
      await unlink(`uploads/${path.replace(/public/gi, '')}`);
    } catch (error) {}
  }
}
