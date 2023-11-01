import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { IsOptional, MinLength } from 'class-validator';

export class UserUpdate implements User {
  @Exclude()
  isActive: boolean;
  @Exclude()
  id: number;
  @IsOptional()
  @MinLength(3, {
    message: 'Nome deve ter no mínimo 3 letras',
  })
  name: string;
  @IsOptional()
  @MinLength(3, {
    message: 'Sobrenome deve ter no mínimo 3 letras',
  })
  lastName: string;
  @Exclude()
  email: string;
  @IsOptional()
  username: string;
  @Exclude()
  password: string;
  birthday: Date;
  bio: string;
  @Exclude()
  avatar: string;
  @Exclude()
  role: string;
}
