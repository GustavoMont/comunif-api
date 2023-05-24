import { ResetPasswordCode } from '@prisma/client';
import * as moment from 'moment';

const resetPasswordsCode: ResetPasswordCode[] = [
  {
    code: '000001',
    expiresAt: moment().add(40, 'minutes').toDate(),
    id: 1,
    userId: 7,
  },
  {
    code: '000002',
    expiresAt: moment().subtract(4, 'days').toDate(),
    id: 2,
    userId: 1,
  },
];

export default resetPasswordsCode;
