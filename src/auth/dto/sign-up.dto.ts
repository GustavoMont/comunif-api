import { Exclude } from 'class-transformer';
import { UserCreate } from 'src/user/dto/user-create.dto';
import { RoleEnum } from 'src/models/User';

export class SignupDto extends UserCreate {
  @Exclude()
  role: RoleEnum;
}
