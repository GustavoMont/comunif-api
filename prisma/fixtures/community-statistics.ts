import { CommunityStatistics } from '@prisma/client';
import * as moment from 'moment';
import communities from './communities';

const communityStatistics: CommunityStatistics[] = [
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
    count: communities.length,
    createdAt: moment().toDate(),
    id: 3,
    userId: null,
  },
];

export default communityStatistics;
