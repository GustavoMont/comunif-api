import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { RequestWithUser } from 'src/types/RequestWithUser';

export const avatarUploadOptions: MulterOptions = {
  storage: diskStorage({
    filename(req: RequestWithUser, file, callback) {
      callback(null, req.user.username);
    },
  }),
};
