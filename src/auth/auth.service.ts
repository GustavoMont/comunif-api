import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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
import { PasswordDto } from './dto/password.dto';
import { RequestUser } from 'src/types/RequestUser';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPayload } from './dto/token-payload';
import { AuthRepository } from './auth.repository.service';
import * as moment from 'moment';
import { v4 } from 'uuid';
import { refreshTokenConstants } from './constants/jwt-constants';
import { IUserRepository } from 'src/user/interfaces/IUserRepository';
import { UserUpdate } from 'src/user/dto/user-update.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(IUserRepository) private userRepository: IUserRepository,
    private jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly securityCodeService: SecurityCodeService,
    private readonly authRepository: AuthRepository,
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
    } as UserUpdate);
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

  protected generateToken(payload: TokenPayload) {
    return this.jwtService.sign(payload);
  }

  protected generateRefreshTokenData(userId: number) {
    return {
      expiresIn: moment()
        .add(refreshTokenConstants.addDaysExpire, 'days')
        .toDate(),
      token: v4(),
      userId,
    };
  }

  protected async createOrUpdateRefreshToken(userId: number): Promise<string> {
    const userToken = await this.authRepository.findByUserId(userId);
    if (!userToken) {
      const { token } = await this.authRepository.create(
        this.generateRefreshTokenData(userId),
      );
      return token;
    }
    const { token } = await this.authRepository.update(
      userToken.id,
      this.generateRefreshTokenData(userId),
    );
    return token;
  }
  async login(user: User): Promise<TokenDto> {
    const payload = this.generatePayload(user);
    const refreshToken = await this.createOrUpdateRefreshToken(user.id);
    return {
      access: this.generateToken(payload),
      refreshToken,
    };
  }
  async refreshToken(
    { refreshToken }: RefreshTokenDto,
    accessToken: string,
  ): Promise<TokenDto> {
    const errorMessage = 'Você não pode realizar essa ação';
    if (!accessToken) {
      throw new HttpException(errorMessage, HttpStatus.UNAUTHORIZED);
    }
    const tokenPayload = this.jwtService.decode(accessToken) as TokenPayload;
    if (!tokenPayload) {
      throw new HttpException(errorMessage, HttpStatus.UNAUTHORIZED);
    }
    const { roles, sub: userId, username } = tokenPayload;
    const userToken = await this.authRepository.findByUserId(userId);
    if (!userToken) {
      throw new HttpException(errorMessage, HttpStatus.UNAUTHORIZED);
    }
    if (moment().isAfter(userToken.expiresIn)) {
      throw new HttpException(errorMessage, HttpStatus.UNAUTHORIZED);
    }
    if (refreshToken !== userToken.token) {
      throw new HttpException(errorMessage, HttpStatus.UNAUTHORIZED);
    }
    const { token } = await this.authRepository.update(
      userToken.id,
      this.generateRefreshTokenData(userId),
    );
    const access = this.generateToken({ sub: userId, roles, username });
    return {
      access,
      refreshToken: token,
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
    return await this.login(createdUser as User);
  }
  async resetPassword(
    body: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    const user = plainToInstance(
      User,
      await this.userRepository.findByEmail(body.email),
    );
    if (!user) {
      throw new HttpException('E-mail não encontrado', HttpStatus.NOT_FOUND);
    }
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
