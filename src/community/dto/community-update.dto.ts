import { Community } from '@prisma/client';
import { Exclude, Transform } from 'class-transformer';
import { MinLength } from 'class-validator';

export class CommunityUpdate implements Community {
  @Exclude()
  id: number;
  @Exclude()
  subjectId: number;
  @MinLength(3, {
    message: 'Nome deve conter no mínimo 3 letras',
  })
  name: string;
  banner: string;
  @Transform(({ value }) =>
    typeof value === 'string' ? value === 'true' : value,
  )
  isActive: boolean;
}
