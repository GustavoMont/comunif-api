import { IEvasionReportRepository } from '../interfaces/IEvasionReportRepository';

export const evasionReportRepositoryMock: IEvasionReportRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  delete: jest.fn(),
};
