import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { avatarPath } from 'src/config/image-paths';

@Controller('public')
export class PublicController {
  @Get('avatar/:path')
  async getIamge(@Param('path') path: string, @Res() res: Response) {
    return res.sendFile(path, {
      root: avatarPath,
    });
  }
}
