import { Module } from '@nestjs/common';
import { SecurityCodeService } from './security-code.service';
import { PrismaService } from 'src/database/prisma.service';
import { SecurityCodeRepository } from './security-code-repository.service';
import { ISecurityCodeService } from './interfaces/ISecurityCodeService';
import { ISecurityCodeRepository } from './interfaces/ISecurityCodeRepository';

@Module({
  providers: [
    {
      provide: ISecurityCodeService,
      useClass: SecurityCodeService,
    },
    {
      provide: ISecurityCodeRepository,
      useClass: SecurityCodeRepository,
    },
    PrismaService,
  ],
  exports: [ISecurityCodeService],
})
export class SecurityCodeModule {}
