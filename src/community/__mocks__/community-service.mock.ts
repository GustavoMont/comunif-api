import { ICommunityService } from '../interfaces/ICommunityService';

export const communityServiceMock: ICommunityService = {
  findById: jest.fn(),
  findUserCommunities: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  findByChannelId: jest.fn(),
  count: jest.fn(),
};
