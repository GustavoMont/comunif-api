import { CommunityChannel } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { MinLength } from 'class-validator';
import { Community } from 'src/models/Community';

export class CreateCommunity implements Community {
  banner: string | null;
  @Exclude()
  isActive: boolean;
  @Exclude()
  id: number;
  @MinLength(3, {
    message: 'Nome deve conter no mínimo 3 letras',
  })
  name: string;
  @MinLength(3, {
    message: 'Assunto deve conter no mínimo 3 letras',
  })
  subject: string;
  @Exclude()
  communityChannels: CommunityChannel[];
}
