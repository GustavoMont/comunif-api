import { IMessageStatisticsRepository } from '../interfaces/IMessageStatisticsRepository';

export const messageStatisticsRepositoryMock: IMessageStatisticsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
};
