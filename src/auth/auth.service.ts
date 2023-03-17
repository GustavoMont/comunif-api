import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/user/user-repository.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token-dto';
import { SignupDto } from './dto/sign-up.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userRepository.findByUsername(username);
    if (user) {
      const isPasswordCorrect = await bcrypt.compare(pass, user.password);
      if (isPasswordCorrect) {
        user.password = undefined;
        return user;
      }
    }
    return null;
  }
  login(user: User): TokenDto {
    const payload = { username: user.username, sub: user.id };
    return {
      access: this.jwtService.sign(payload),
    };
  }

  async signup(body: SignupDto): Promise<TokenDto> {
    if (body.password !== body.confirmPassword) {
      throw new HttpException('Senhas não coincidem', HttpStatus.BAD_REQUEST);
    }
    const emailExists = await this.userRepository.findByEmail(body.email);
    if (!!emailExists) {
      throw new HttpException('E-mail já cadastrado', HttpStatus.BAD_REQUEST);
    }
    const usernameExists = await this.userRepository.findByUsername(
      body.username,
    );
    if (!!usernameExists) {
      throw new HttpException(
        'Username já está em uso',
        HttpStatus.BAD_REQUEST,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...userData } = body;
    let user: User;
    const createdUser = await this.userRepository.create(
      Object.assign(
        {
          ...userData,
          birthday: new Date(body.birthday),
          password: await bcrypt.hash(userData.password, 10),
        },
        user,
      ),
    );
    return this.login(createdUser);
  }
}
