import { Community } from '@prisma/client';
import { Exclude, Transform } from 'class-transformer';
import { IsOptional, MinLength } from 'class-validator';

export class CommunityUpdate implements Community {
  adminId: number;
  @Exclude()
  id: number;
  @Exclude()
  subject: string;
  @MinLength(3, {
    message: 'Nome deve conter no mínimo 3 letras',
  })
  name: string;
  banner: string;
  @Transform(({ value }) =>
    typeof value === 'string' ? value === 'true' : value,
  )
  @IsOptional()
  isActive: boolean;
}
