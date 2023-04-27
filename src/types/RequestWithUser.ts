import { Request } from 'express';
import { RequestUser } from './RequestUser';

export interface RequestWithUser extends Request {
  user: RequestUser;
}
