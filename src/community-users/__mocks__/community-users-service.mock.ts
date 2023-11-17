import { ICommunityUsersService } from '../interfaces/ICommunityUsersService';

export const communityUsersServiceMock: ICommunityUsersService = {
  addUser: jest.fn(),
  findCommunityMembers: jest.fn(),
  isUserInCommunity: jest.fn(),
  leaveCommunity: jest.fn(),
};
