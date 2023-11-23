import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { IFileService } from './interfaces/IFileService';

@Module({
  providers: [
    {
      provide: IFileService,
      useClass: FileService,
    },
  ],
  exports: [IFileService],
})
export class FileModule {}
