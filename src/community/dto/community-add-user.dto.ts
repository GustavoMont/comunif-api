import { IsInt, IsNotEmpty } from 'class-validator';

export class CommunityAddUser {
  @IsNotEmpty({ message: 'A comunidade deve ser informada' })
  @IsInt({ message: 'Deve ser um número' })
  communityId: number;
}
