import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntUndefinedPipe implements PipeTransform {
  transform(value: string | undefined) {
    return isNaN(+value) ? undefined : +value;
  }
}
