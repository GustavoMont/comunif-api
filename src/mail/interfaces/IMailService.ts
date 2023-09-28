import { User } from 'src/models/User';

export interface IMailService {
  resetPassword(user: User, code: string): Promise<void>;
  passwordUpdated(user: User): Promise<void>;
}

export const IMailService = Symbol('IMailService');
