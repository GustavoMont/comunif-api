import { IUserService } from '../interfaces/IUserService';

export const userServiceMock: IUserService = {
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  changePassword: jest.fn(),
  emailExists: jest.fn(),
  usernameExists: jest.fn(),
  validateUser: jest.fn(),
  deactivate: jest.fn(),
  activate: jest.fn(),
  count: jest.fn(),
};
