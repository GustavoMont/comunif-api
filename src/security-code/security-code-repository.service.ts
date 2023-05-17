import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ISecurityCodeRepository } from './interfaces/ISecurityCodeRepository';
import { ResetPasswordCode } from '@prisma/client';

@Injectable()
export class SecurityCodeRepository implements ISecurityCodeRepository {
  constructor(private readonly db: PrismaService) {}
  async createCode(code: string, userId: number): Promise<ResetPasswordCode> {
    return await this.db.resetPasswordCode.create({
      data: {
        code,
        userId,
      },
    });
  }
  async findByCode(code: string): Promise<ResetPasswordCode> {
    return await this.db.resetPasswordCode.findUnique({
      where: {
        code,
      },
    });
  }
}
