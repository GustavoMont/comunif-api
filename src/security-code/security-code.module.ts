import { Module } from '@nestjs/common';
import { SecurityCodeService } from './security-code.service';
import { PrismaService } from 'src/database/prisma.service';
import { SecurityCodeRepository } from './security-code-repository.service';

@Module({
  providers: [SecurityCodeService, PrismaService, SecurityCodeRepository],
  exports: [SecurityCodeService],
})
export class SecurityCodeModule {}
