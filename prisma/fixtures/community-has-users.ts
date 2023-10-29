import { CommunityHasUsers } from '@prisma/client';

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
];

export default communityHasUsers;
