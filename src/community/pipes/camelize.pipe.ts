import { PipeTransform } from '@nestjs/common';
import * as camelize from 'camelize';
import { CommunityQueryDto } from '../dto/community-query.dto';

export class CamelizePipe implements PipeTransform {
  transform(value: CommunityQueryDto) {
    return camelize(value);
  }
}
