import { RequestUser } from 'src/types/RequestUser';
import { CreateUserEvasionReportDto } from '../dto/create-user-evasion-report.dto';
import { EvasionReportResponseDto } from '../dto/evasion-report-response.dto';
import { ListResponse } from 'src/dtos/list.dto';
import { EvasionReportFiltersDto } from '../dto/evasion-report-filters.dto';

export interface IEvasionReportService {
  createReportByUser(
    data: CreateUserEvasionReportDto,
    user: RequestUser,
  ): Promise<EvasionReportResponseDto>;
  findById(id: number): Promise<EvasionReportResponseDto>;
  findMany(
    page: number,
    take: number,
    filters?: EvasionReportFiltersDto,
  ): Promise<ListResponse<EvasionReportResponseDto>>;
  delete(id: number): Promise<void>;
}

export const IEvasionReportService = Symbol('IEvasionReportService');
