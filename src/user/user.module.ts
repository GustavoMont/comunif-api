import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user-repository.service';
import { PrismaClient } from '@prisma/client';
import { IUserService } from './interfaces/IUserService';
import { IUserRepository } from './interfaces/IUserRepository';

@Module({
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
