import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserRepository } from './user-repository.service';

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}
  async findAll(): Promise<User[]> {
    return await this.repository.findAll();
  }
}
