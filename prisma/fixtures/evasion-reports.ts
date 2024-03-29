import { EvasionReport } from '@prisma/client';
import * as moment from 'moment';
import users from './users';

const evasionReports: EvasionReport[] = [
  {
    communityId: 5,
    id: 1,
    reason: null,
    removedAt: moment().toDate(),
    removerId: null,
    userId: users.find(({ username }) => username === 'sailson').id,
  },
  {
    communityId: 2,
    id: 2,
    reason: 'Saí pq todo mundo aqui não presta',
    removedAt: moment().toDate(),
    removerId: null,
    userId: 4,
  },
  {
    communityId: 5,
    id: 3,
    reason: 'Esse cara pipocou, ele é um bananão',
    removedAt: moment().toDate(),
    removerId: 1,
    userId: users.find(({ username }) => username === 'banido').id,
  },
];

export default evasionReports;
