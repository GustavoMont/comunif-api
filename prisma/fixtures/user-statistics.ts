import { UserStatistics } from '@prisma/client';
import * as moment from 'moment';

const userStatistics: UserStatistics[] = [
  {
    count: 2,
    createdAt: moment().subtract(2, 'months').toDate(),
    id: 1,
    userId: null,
  },
  {
    count: 4,
    createdAt: moment().subtract(1, 'months').toDate(),
    id: 2,
    userId: null,
  },
  {
    count: 8,
    createdAt: moment().startOf('month').toDate(),
    id: 3,
    userId: null,
  },
];

export default userStatistics;
