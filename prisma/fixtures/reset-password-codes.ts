import { ResetPasswordCode } from '@prisma/client';
import * as moment from 'moment';

const resetPasswordsCode: ResetPasswordCode[] = [
  {
    code: '000001',
    expiresAt: moment().add(40, 'minutes').toDate(),
    id: 1,
    userId: 7,
  },
];

export default resetPasswordsCode;
