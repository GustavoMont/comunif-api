import { EvasionReport } from 'src/models/EvasionReport';
import { EvasionReportFiltersDto } from '../dto/evasion-report-filters.dto';

export interface IEvasionReportRepository {
  create(evasionReport: EvasionReport): Promise<EvasionReport>;
  findById(id: number): Promise<EvasionReport>;
  findMany(
    skip: number,
    take: number,
    filters: EvasionReportFiltersDto,
  ): Promise<EvasionReport[]>;
  count(filters?: EvasionReportFiltersDto): Promise<number>;
  delete(id: number): Promise<void>;
}

export const IEvasionReportRepository = Symbol('IEvasionReportRepository');
