import { UserTokens } from '@prisma/client';
import { CreateUpdateToken } from '../dto/create-update-token.dto';

export interface IAuthRepository {
  findByUserId(userId: number): Promise<UserTokens>;
  update(id: number, data: CreateUpdateToken): Promise<UserTokens>;
  create(data: CreateUpdateToken): Promise<UserTokens>;
}

export const IAuthRepository = Symbol('IAuthRepository');
