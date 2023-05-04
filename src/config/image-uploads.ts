import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { RequestWithUser } from 'src/types/RequestWithUser';
import * as fs from 'fs/promises';
import { FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common';

export const DEFAULT_EXTENSION = 'webp';
export const validators = [
  new MaxFileSizeValidator({ maxSize: 1000 * 800 }),
  new FileTypeValidator({ fileType: 'image/*' }),
];

export const avatarPath = 'uploads/avatar';
export const bannerPath = 'uploads/banner';

export const avatarUploadOptions: MulterOptions = {
  storage: diskStorage({
    async destination(req, file, callback) {
      try {
        await fs.mkdir(avatarPath, { recursive: true });
        return callback(null, avatarPath);
      } catch (error) {
        return callback(error, avatarPath);
      }
    },
    filename(req: RequestWithUser, file, callback) {
      callback(null, `${req.user.username}-avatar.${DEFAULT_EXTENSION}`);
    },
  }),
};

export const bannerUploadOptions: MulterOptions = {
  storage: diskStorage({
    async destination(req, file, callback) {
      try {
        await fs.mkdir(bannerPath, { recursive: true });
        return callback(null, bannerPath);
      } catch (error) {
        return callback(error, bannerPath);
      }
    },
    filename(req: RequestWithUser, file, callback) {
      callback(null, `${req.body.name}-banner.${DEFAULT_EXTENSION}`);
    },
  }),
};
