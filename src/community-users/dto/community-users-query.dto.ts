import { User } from 'src/models/User';

export class CommunityUsersQueryDto {
  user: Pick<User, 'isActive'>;
}
