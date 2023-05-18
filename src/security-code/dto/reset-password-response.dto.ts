import { ResetPasswordCode } from '@prisma/client';
import { User } from 'src/models/User';

export class ResetPasswordResponse implements ResetPasswordCode {
  id: number;
  code: string;
  expiresAt: Date;
  userId: number;
  user: User;
}
