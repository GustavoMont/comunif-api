import { IMessageService } from '../interfaces/IMessageService';

export const messageServiceMock: IMessageService = {
  create: jest.fn(),
  findByChannelId: jest.fn(),
  countMessages: jest.fn(),
};
