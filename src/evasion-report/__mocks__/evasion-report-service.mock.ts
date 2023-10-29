import { IEvasionReportService } from '../interfaces/IEvasionReportService';

export const evasionReportServiceMock: IEvasionReportService = {
  createReportByUser: jest.fn(),
};
