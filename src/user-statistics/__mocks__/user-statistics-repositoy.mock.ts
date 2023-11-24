import { IUserStatisticsRepository } from '../interfaces/IUserStatisticsRepository';

export const userStatisticsRepositoryMock: IUserStatisticsRepository = {
  findAll: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
};
