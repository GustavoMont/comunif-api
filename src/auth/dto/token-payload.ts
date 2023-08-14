import { RoleEnum } from 'src/models/User';

export class TokenPayload {
  username: string;
  sub: number;
  roles: RoleEnum[];
}
