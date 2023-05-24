import { ResetPasswordCode } from '@prisma/client';

export abstract class ISecurityCodeRepository {
  abstract findByCode(code: string): Promise<ResetPasswordCode | null>;
  abstract createCode(code: string, userId: number): Promise<ResetPasswordCode>;
  abstract getUserCode(userId: number): Promise<ResetPasswordCode>;
  abstract deletePassword(id: number): Promise<void>;
}
