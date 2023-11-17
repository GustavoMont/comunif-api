import { ICommunityUsersRepostory } from '../interfaces/ICommunityUserRepository';

export const communityUsersRepositoryMock: ICommunityUsersRepostory = {
  findUser: jest.fn(),
  addUser: jest.fn(),
  findCommunityMembers: jest.fn(),
  countCommunityMembers: jest.fn(),
  delete: jest.fn(),
};
