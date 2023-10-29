import { EvasionReport } from 'src/models/EvasionReport';

export interface IEvasionReportRepository {
  create(evasionReport: EvasionReport): Promise<EvasionReport>;
}

export const IEvasionReportRepository = Symbol('IEvasionReportRepository');
