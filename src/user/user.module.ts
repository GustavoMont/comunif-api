import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user-repository.service';
import { PrismaClient } from '@prisma/client';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaClient],
  exports: [UserRepository],
})
export class UserModule {}
