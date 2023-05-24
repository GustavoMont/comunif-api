import { ResetPasswordCode } from '@prisma/client';
import { ResetPasswordResponse } from '../dto/reset-password-response.dto';

export abstract class ISecurityCodeService {
  abstract findByCode(code: string): Promise<ResetPasswordResponse>;
  abstract createCode(userId: number): Promise<ResetPasswordCode>;
  abstract isCodeExpired(code: ResetPasswordCode): boolean;
}
