import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import * as camelize from 'camelize';
import { plainToInstance } from 'class-transformer';

export class CamelizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return plainToInstance(metadata.metatype, camelize(value));
  }
}
