import { Injectable, Logger } from '@nestjs/common';
import { env } from 'src/constants/env';
import { readFile, unlink } from 'fs/promises';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from 'src/config/firebase.config';
import { getStorage, ref, uploadBytes } from 'firebase/storage';

@Injectable()
export class ImageService {
  private logger: Logger = new Logger('ImageService');
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
  public async updloadImage(banner: string) {
    try {
      const path = this.getImagePath(banner);
      const app = initializeApp(firebaseConfig);
      const storage = getStorage(app);
      const imageRef = ref(storage, path);
      const file = await readFile(`uploads/${path}`);
      uploadBytes(imageRef, file).then(() => {
        console.log('Uploaded a blob or file!');
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
