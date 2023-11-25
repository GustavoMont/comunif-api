import { IMessageRepository } from '../interfaces/IMessageRepository';

export const messageRepositoryMock: IMessageRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByChannelId: jest.fn(),
  count: jest.fn(),
};
