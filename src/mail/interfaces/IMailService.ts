import { User } from 'src/models/User';

export abstract class IMailService {
  abstract resetPassword(user: User, code: string): Promise<void>;
}
