import { ResetPasswordCode } from '@prisma/client';
import { ResetPasswordResponse } from '../dto/reset-password-response.dto';

export interface ISecurityCodeService {
  findByCode(code: string): Promise<ResetPasswordResponse>;
  createCode(userId: number): Promise<ResetPasswordCode>;
  isCodeExpired(code: ResetPasswordCode): boolean;
}

export const ISecurityCodeService = Symbol('ISecurityCodeService');
