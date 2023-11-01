import { EvasionReport } from '@prisma/client';
import * as moment from 'moment';

const evasionReports: EvasionReport[] = [
  // usuário saiu da comunidade
  {
    communityId: 2,
    id: 1,
    reason: null,
    removedAt: moment().toDate(),
    removerId: null,
    userId: 11,
  },
  // um usuário que saiu da comunidade errada
  {
    communityId: 1,
    id: 2,
    reason: 'Saí pq todo mundo aqui não presta',
    removedAt: moment().toDate(),
    removerId: null,
    userId: 12,
  },
];

export default evasionReports;
