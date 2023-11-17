import { EvasionReportResponseDto } from 'src/evasion-report/dto/evasion-report-response.dto';
import { User } from 'src/models/User';
import { UserResponse } from 'src/user/dto/user-response.dto';

export interface IMailService {
  resetPassword(user: User, code: string): Promise<void>;
  passwordUpdated(user: User): Promise<void>;
  deactivateUser(user: User, reason: string): Promise<void>;
  activateUser(user: User): Promise<void>;
  userLeftCommunity(
    report: EvasionReportResponseDto,
    responsable: User,
  ): Promise<void>;
  notificateBanUser(report: EvasionReportResponseDto): Promise<void>;
  notificateBanResponsible(
    report: EvasionReportResponseDto,
    responsable: UserResponse,
  ): Promise<void>;
}

export const IMailService = Symbol('IMailService');
