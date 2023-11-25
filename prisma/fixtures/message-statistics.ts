import { MessageStatistics } from '@prisma/client';
import * as moment from 'moment';

const messageStatistics: MessageStatistics[] = [
  {
    count: 0,
    createdAt: moment().subtract(2, 'months').toDate(),
    id: 1,
    userId: null,
  },
  {
    count: 0,
    createdAt: moment().subtract(1, 'months').toDate(),
    id: 2,
    userId: null,
  },
];

export default messageStatistics;
