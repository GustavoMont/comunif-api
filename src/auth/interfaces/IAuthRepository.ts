import { UserTokens } from '@prisma/client';

export interface CreateUpdateToken {
  userId: number;
  token: string;
  expiresIn: Date;
}

export interface IAuthRepository {
  findByUserId(userId: number): Promise<UserTokens>;
  update(id: number, data: CreateUpdateToken): Promise<UserTokens>;
  create(data: CreateUpdateToken): Promise<UserTokens>;
}
