import { Injectable, Request, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { LocalStrategy } from 'src/auth/strategies/local.strategy';
import { UserRepository } from './user-repository.service';

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}
  async findAll(): Promise<User[]> {
    return await this.repository.findAll();
  }

  test() {
    return 'testando';
  }
}
