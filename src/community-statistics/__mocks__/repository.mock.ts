import { ICommunityStatisticsRepository } from '../interfaces/ICommunityStatisticsRepository';

export const repositoryMock: ICommunityStatisticsRepository = {
  count: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
};
