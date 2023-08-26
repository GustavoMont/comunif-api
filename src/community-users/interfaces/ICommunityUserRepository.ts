import { Community } from 'src/models/Community';
import { User } from 'src/models/User';

export interface ICommunityUsersRepostory {
  findUser(communityId: number, userId: number): Promise<User>;
  addUser(communityId: number, userId: number): Promise<Community>;
}

export const ICommunityUsersRepostory = Symbol('ICommunityUsersRepostory');
