import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user-repository.service';
import { PrismaClient } from '@prisma/client';
import { IUserService } from './interfaces/IUserService';
import { IUserRepository } from './interfaces/IUserRepository';
import { MailModule } from 'src/mail/mail.module';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [MailModule, FileModule],
  controllers: [UserController],
  providers: [
    {
      provide: IUserService,
      useClass: UserService,
    },
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    PrismaClient,
  ],
  exports: [IUserService, IUserRepository],
})
export class UserModule {}
