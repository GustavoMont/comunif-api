import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/user/user-repository.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserRepository,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(username);

    if (user) {
      const isPasswordCorrect = await bcrypt.compare(pass, user.password);
      if (isPasswordCorrect) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }
  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access: this.jwtService.sign(payload),
    };
  }
}
