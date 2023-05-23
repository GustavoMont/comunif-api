import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token-dto';
import { SignupDto } from './dto/sign-up.dto';
import { IAuthService } from './interfaces/IAuthService';
import { MailService } from 'src/mail/mail.service';
import { SecurityCodeService } from 'src/security-code/security-code.service';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/models/User';

import { ConfirmResetPasswordCodeDto } from 'src/user/dto/confirm-reset-password-code.dto';
import { ConfirmCodeResponse } from './dto/confirm-code-response.dto';
import {
  ResetPasswordDto,
  ResetPasswordResponseDto,
} from './dto/reset-password.dto';
import { UserRepository } from 'src/user/user-repository.service';
import { PasswordDto } from './dto/password.dto';
import { RequestUser } from 'src/types/RequestUser';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly securityCodeService: SecurityCodeService,
  ) {}
  isPasswordEqual(password: string, confirmPassword: string): boolean {
    if (password !== confirmPassword) {
      throw new HttpException('Senhas não coincidem', HttpStatus.BAD_REQUEST);
    }
    return true;
  }
  async changePassword(
    { id: userId }: RequestUser,
    { confirmPassword, password }: PasswordDto,
  ): Promise<void> {
    this.isPasswordEqual(password, confirmPassword);
    const user = await this.userRepository.update(userId, {
      password: await bcrypt.hash(password, 10),
    });
    await this.mailService.passwordUpdated(user as User);
  }

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
  protected generatePayload(user: User) {
    return {
      username: user.username,
      sub: user.id,
      roles: [user.role],
    };
  }
  login(user: User): TokenDto {
    const payload = this.generatePayload(user);

    return {
      access: this.jwtService.sign(payload),
    };
  }
  async signup(body: SignupDto): Promise<TokenDto> {
    this.isPasswordEqual(body.password, body.confirmPassword);
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
    return this.login(createdUser as User);
  }
  async resetPassword(
    body: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    const user = plainToInstance(
      User,
      await this.userRepository.findByEmail(body.email),
    );
    const resetCode = await this.securityCodeService.createCode(user.id);
    await this.mailService.resetPassword(user, resetCode.code);
    return new ResetPasswordResponseDto(await bcrypt.hash(user.email, 10));
  }
  async confirmCode({
    code,
    email,
  }: ConfirmResetPasswordCodeDto): Promise<ConfirmCodeResponse> {
    const resetCode = await this.securityCodeService.findByCode(code);
    const emailMatches = await bcrypt.compare(resetCode.user.email, email);
    if (!emailMatches) {
      throw new HttpException('Código inválido', HttpStatus.BAD_REQUEST);
    }
    const payload = this.generatePayload(resetCode.user);
    return {
      access: this.jwtService.sign(payload, { expiresIn: '1h' }),
    };
  }
}
