import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ISecurityCodeService } from './interfaces/ISecurityCodeService';
import { ResetPasswordCode } from '@prisma/client';
import { SecurityCodeRepository } from './security-code-repository.service';

@Injectable()
export class SecurityCodeService implements ISecurityCodeService {
  constructor(private readonly repository: SecurityCodeRepository) {}
  protected generateRandomInt(): number {
    return Math.floor(Math.random() * (9 - 0 + 1) + 0);
  }
  protected generateCode(): string {
    return Array.from({ length: 6 }, () =>
      this.generateRandomInt().toString(),
    ).join('');
  }
  protected async generateUniqueCode(): Promise<string> {
    const code: string = this.generateCode();
    const codeExists = await this.repository.findByCode(code);
    if (codeExists) {
      return this.generateUniqueCode();
    }
    return code;
  }
  async createCode(userId: number): Promise<ResetPasswordCode> {
    const code = await this.generateUniqueCode();
    return await this.repository.createCode(code, userId);
  }
  async findByCode(code: string): Promise<ResetPasswordCode> {
    const resetCode = await this.repository.findByCode(code);
    if (!resetCode) {
      throw new HttpException('Código não existe', HttpStatus.NOT_FOUND);
    }
    return resetCode;
  }
}
