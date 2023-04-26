import { Community, User } from '@prisma/client';

export interface ICommunityRepository {
  addUser(communityId: number, userId: number): Promise<Community>;
  findUser(communityId: number, userId: number): Promise<User>;
  findById(id: number): Promise<Community>;
  findUserCommunities(userId: number): Promise<Community[]>;
  findAll(): Promise<Community[]>;
  update(id: number, changes: Partial<Community>): Promise<Community>;
}
