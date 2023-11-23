import { Controller, Get, Inject, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { IFileService } from 'src/file/interfaces/IFileService';

@Controller('public')
export class PublicController {
  constructor(
    @Inject(IFileService) private readonly fileService: IFileService,
  ) {}
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
