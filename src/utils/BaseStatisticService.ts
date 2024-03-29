import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { Service } from './services';
import * as moment from 'moment';

export class BaseStatisticService extends Service {
  generateDefaultFilters(): StatisticsQueryDto {
    const format = 'YYYY-MM-DD';
    return {
      from: new Date(moment().subtract(2, 'months').format(format)),
      to: new Date(moment().add(4, 'days').format(format)),
    };
  }
  getMonthRange(): { firstDay: Date; lastDay: Date } {
    const firstDay = moment().startOf('month').toDate();
    const lastDay = moment().endOf('month').toDate();
    return {
      firstDay,
      lastDay,
    };
  }
}
