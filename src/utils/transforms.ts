import { TransformFnParams } from 'class-transformer';
import * as moment from 'moment';

type TransformFn = (params: TransformFnParams) => any;

export const responseDateTransform: TransformFn = ({ value }) =>
  moment(value).format('YYYY-MM-DD');
