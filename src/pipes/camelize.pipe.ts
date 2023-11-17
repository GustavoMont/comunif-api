import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import * as camelize from 'camelize';

export class CamelizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'query') {
      return camelize(value);
    }
    return value;
  }
}
