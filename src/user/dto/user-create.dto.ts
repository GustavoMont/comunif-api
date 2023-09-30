import { Exclude, Transform } from 'class-transformer';
import { RoleEnum, User } from 'src/models/User';
import { PasswordDto } from './password.dto';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { MinAge } from 'src/decorators/min-age.decorator';

export class UserCreate extends PasswordDto implements User {
  @Exclude()
  isActive: boolean;
  @Exclude()
  id: number;
  @IsNotEmpty({ message: 'Nome é um campo obrigatório' })
  name: string;
  @IsNotEmpty({ message: 'Sobrenomeome é um campo obrigatório' })
  lastName: string;
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;
  @IsNotEmpty({ message: 'username é um campo obrigatório' })
  username: string;
  @MinAge({
    message: 'Idade mínima de 15 anos',
  })
  birthday: Date;
  @Exclude()
  bio: string;
  @Exclude()
  avatar: string;
  @Transform(({ value }) => (value === undefined ? RoleEnum.user : value))
  role: RoleEnum;
}
