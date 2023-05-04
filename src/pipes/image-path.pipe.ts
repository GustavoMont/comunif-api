import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PathPipe implements PipeTransform<string, Promise<string>> {
  async transform(filename: string): Promise<string> {
    if (filename) {
      return `public/${filename.replace(/uploads\//g, '')}`;
    } else {
      return null;
    }
  }
}
