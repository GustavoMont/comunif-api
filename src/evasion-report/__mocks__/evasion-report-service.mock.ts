import { IEvasionReportService } from '../interfaces/IEvasionReportService';

export const evasionReportServiceMock: IEvasionReportService = {
  createReportByUser: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  delete: jest.fn(),
};
