import { RequestUser } from 'src/types/RequestUser';
import { CreateUserEvasionReportDto } from '../dto/create-user-evasion-report.dto';
import { EvasionReportResponseDto } from '../dto/evasion-report-response.dto';

export interface IEvasionReportService {
  createReportByUser(
    data: CreateUserEvasionReportDto,
    user: RequestUser,
  ): Promise<EvasionReportResponseDto>;
}

export const IEvasionReportService = Symbol('IEvasionReportService');
