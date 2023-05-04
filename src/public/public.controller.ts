import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('public')
export class PublicController {
  @Get(':dir/:path')
  async getIamge(
    @Param('dir') dir: string,
    @Param('path') path: string,
    @Res() res: Response,
  ) {
    return res.sendFile(`${dir}/${path}`, {
      root: 'uploads/',
    });
  }
}
