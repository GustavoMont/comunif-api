import { EvasionReport } from '@prisma/client';
import * as moment from 'moment';
import users from './users';

const evasionReports: EvasionReport[] = [
  // usuário saiu da comunidade
  {
    communityId: 5,
    id: 1,
    reason: null,
    removedAt: moment().toDate(),
    removerId: null,
    userId: users.find(({ username }) => username === 'sailson').id,
  },
  // um usuário que saiu da comunidade errada
  {
    communityId: 2,
    id: 2,
    reason: 'Saí pq todo mundo aqui não presta',
    removedAt: moment().toDate(),
    removerId: null,
    userId: users.find(({ username }) => username === 'sem_comunidade').id,
  },
];

export default evasionReports;
