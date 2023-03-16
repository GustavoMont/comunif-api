import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return await this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('bloqueado')
  async test(@Request() req): Promise<string> {
    return req.user;
  }
}
