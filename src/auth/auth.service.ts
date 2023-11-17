import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token-dto';
import { SignupDto } from './dto/sign-up.dto';
import { IAuthService } from './interfaces/IAuthService';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/models/User';
import { ConfirmResetPasswordCodeDto } from 'src/user/dto/confirm-reset-password-code.dto';
import { ConfirmCodeResponse } from './dto/confirm-code-response.dto';
import {
  ResetPasswordDto,
  ResetPasswordResponseDto,
} from './dto/reset-password.dto';
import { PasswordDto } from '../user/dto/password.dto';
import { RequestUser } from 'src/types/RequestUser';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPayload } from './dto/token-payload';
import * as moment from 'moment';
import { v4 } from 'uuid';
import { refreshTokenConstants } from './constants/jwt-constants';
import { IUserService } from 'src/user/interfaces/IUserService';
import { IAuthRepository } from './interfaces/IAuthRepository';
import { IMailService } from 'src/mail/interfaces/IMailService';
import { ISecurityCodeService } from 'src/security-code/interfaces/ISecurityCodeService';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(IUserService) private userService: IUserService,
    private jwtService: JwtService,
    @Inject(IMailService) private readonly mailService: IMailService,
    @Inject(ISecurityCodeService)
    private readonly securityCodeService: ISecurityCodeService,
    @Inject(IAuthRepository) private readonly authRepository: IAuthRepository,
  ) {}
  isPasswordEqual(password: string, confirmPassword: string): boolean {
    if (password !== confirmPassword) {
      throw new HttpException('Senhas não coincidem', HttpStatus.BAD_REQUEST);
    }
    return true;
  }
  async changePassword(
    { id: userId }: RequestUser,
    body: PasswordDto,
  ): Promise<void> {
    const user = await this.userService.changePassword(userId, body);
    await this.mailService.passwordUpdated(user as User);
  }

  async validateUser(username: string, pass: string) {
    try {
      return await this.userService.validateUser(username, pass);
    } catch (error) {
      return null;
    }
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
    const user = await this.userService.create(body);
    return this.login(user);
  }
  async resetPassword(
    body: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    const user = plainToInstance(
      User,
      await this.userService.findByEmail(body.email),
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
