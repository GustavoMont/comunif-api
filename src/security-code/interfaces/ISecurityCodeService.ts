import { ResetPasswordCode } from '@prisma/client';

export abstract class ISecurityCodeService {
  abstract findByCode(code: string): Promise<ResetPasswordCode>;
  abstract createCode(userId: number): Promise<ResetPasswordCode>;
}
