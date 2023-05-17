import { Module } from '@nestjs/common';
import { SecurityCodeService } from './security-code.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  providers: [SecurityCodeService, PrismaService],
})
export class SecurityCodeModule {}
