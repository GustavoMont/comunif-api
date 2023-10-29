import { EvasionReportResponseDto } from 'src/evasion-report/dto/evasion-report-response.dto';
import { User } from 'src/models/User';

export interface IMailService {
  resetPassword(user: User, code: string): Promise<void>;
  passwordUpdated(user: User): Promise<void>;
  deactivateUser(user: User, reason: string): Promise<void>;
  activateUser(user: User): Promise<void>;
  userLeftCommunity(
    report: EvasionReportResponseDto,
    responsable: User,
  ): Promise<void>;
}

export const IMailService = Symbol('IMailService');
