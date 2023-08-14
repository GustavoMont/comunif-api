import { UserTokens } from '@prisma/client';
import * as moment from 'moment';
import { v4 } from 'uuid';

export const userTokens: UserTokens[] = [
  {
    expiresIn: moment().add(7, 'days').toDate(),
    id: 1,
    token: v4(),
    userId: 2,
  },
];
