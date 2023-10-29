import { IMailService } from '../interfaces/IMailService';

export const mailServiceMock: IMailService = {
  resetPassword: jest.fn(),
  passwordUpdated: jest.fn(),
  deactivateUser: jest.fn(),
  activateUser: jest.fn(),
  userLeftCommunity: jest.fn(),
};
