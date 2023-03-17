import { Controller, Get, Post, Request, Res } from '@nestjs/common';
import { User } from '@prisma/client';

import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return await this.service.findAll();
  }

  @Post('test')
  create() {
    return 'A';
  }
}
