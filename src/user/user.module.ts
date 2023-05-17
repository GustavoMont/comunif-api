import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user-repository.service';
import { PrismaClient } from '@prisma/client';
import { MailModule } from 'src/mail/mail.module';
import { SecurityCodeModule } from 'src/security-code/security-code.module';

@Module({
  imports: [MailModule, SecurityCodeModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaClient],
  exports: [UserRepository],
})
export class UserModule {}
