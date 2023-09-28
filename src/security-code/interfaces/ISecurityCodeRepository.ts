import { ResetPasswordCode } from '@prisma/client';

export interface ISecurityCodeRepository {
  findByCode(code: string): Promise<ResetPasswordCode | null>;
  createCode(code: string, userId: number): Promise<ResetPasswordCode>;
  getUserCode(userId: number): Promise<ResetPasswordCode>;
  deletePassword(id: number): Promise<void>;
}

export const ISecurityCodeRepository = Symbol('ISecurityCodeRepository');
