import { CommunityHasUsers } from '@prisma/client';
import users from './users';

const communityHasUsers: CommunityHasUsers[] = [
  {
    communityId: 1,
    id: 1,
    userId: 2,
  },
  {
    communityId: 1,
    id: 2,
    userId: 9,
  },
  {
    communityId: 2,
    id: 3,
    userId: 10,
  },
  {
    communityId: 5,
    id: 4,
    userId: users.find(({ username }) => username === 'sailson').id,
  },
  {
    communityId: 2,
    id: 5,
    userId: 4,
  },
  {
    communityId: 5,
    id: 6,
    userId: users.find(({ username }) => username === 'banido').id,
  },
];

export default communityHasUsers;
