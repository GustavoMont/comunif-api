import { IMessageStatisticsService } from '../interfaces/IMessageStatisticsService';

export const messageStatisticsServiceMock: IMessageStatisticsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  countMessages: jest.fn(),
};
