import { PipeTransform } from '@nestjs/common';
import * as camelize from 'camelize';
import {
  CommunityQueryCamelized,
  CommunityQueryDto,
} from '../dto/community-query.dto';

export class CamelizePipe implements PipeTransform {
  transform(value: CommunityQueryDto): CommunityQueryCamelized {
    return camelize(value);
  }
}
