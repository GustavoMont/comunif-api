import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ISecurityCodeService } from './interfaces/ISecurityCodeService';
import { ResetPasswordCode } from '@prisma/client';
import * as moment from 'moment';
import { plainToInstance } from 'class-transformer';
import { ResetPasswordResponse } from './dto/reset-password-response.dto';
import { ISecurityCodeRepository } from './interfaces/ISecurityCodeRepository';

@Injectable()
export class SecurityCodeService implements ISecurityCodeService {
  constructor(
    @Inject(ISecurityCodeRepository)
    private readonly repository: ISecurityCodeRepository,
  ) {}
  isCodeExpired(code: ResetPasswordCode): boolean {
    return moment(code.expiresAt).isBefore(moment());
  }
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
    const resetCode = await this.repository.getUserCode(userId);
    if (!!resetCode) {
      if (!this.isCodeExpired(resetCode)) {
        return resetCode;
      } else {
        await this.repository.deletePassword(resetCode.id);
      }
    }
    const code = await this.generateUniqueCode();
    return await this.repository.createCode(code, userId);
  }
  async findByCode(code: string): Promise<ResetPasswordResponse> {
    const resetCode = await this.repository.findByCode(code);
    if (!resetCode) {
      throw new HttpException('Código não encontrado', HttpStatus.NOT_FOUND);
    } else if (this.isCodeExpired(resetCode)) {
      throw new HttpException('Esse código já expirou', HttpStatus.BAD_REQUEST);
    }
    return plainToInstance(ResetPasswordResponse, resetCode);
  }
}
