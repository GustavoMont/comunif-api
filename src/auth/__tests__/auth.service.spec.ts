import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { SignupDto } from '../dto/sign-up.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from 'src/user/dto/user-response.dto';
import {
  resetPasswordCodeGenerator,
  userGenerator,
  userTokenGenerator,
} from 'src/utils/generators';
import { ResetPasswordResponseDto } from '../dto/reset-password.dto';
import { RequestUser } from 'src/types/RequestUser';
import { RoleEnum } from 'src/models/User';
import * as uuid from 'uuid';
import * as moment from 'moment';
import { IUserService } from 'src/user/interfaces/IUserService';
import { IAuthRepository } from '../interfaces/IAuthRepository';
import { IMailService } from 'src/mail/interfaces/IMailService';
import { ISecurityCodeService } from 'src/security-code/interfaces/ISecurityCodeService';
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: IAuthRepository;
  let userService: IUserService;
  let jwtService: JwtService;
  let securityCodeService: ISecurityCodeService;
  let mailService: IMailService;
  const code = '000001';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: IUserService,
          useValue: {
            validateUser: jest.fn(),
            changePassword: jest.fn(),
            create: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ISecurityCodeService,
          useValue: {
            createCode: jest.fn(),
            findByCode: jest.fn(),
          },
        },
        {
          provide: IMailService,
          useValue: {
            resetPassword: jest.fn(),
            passwordUpdated: jest.fn(),
          },
        },
        {
          provide: IAuthRepository,
          useValue: {
            findByUserId: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<IUserService>(IUserService);
    jwtService = module.get<JwtService>(JwtService);
    securityCodeService =
      module.get<ISecurityCodeService>(ISecurityCodeService);
    mailService = module.get<IMailService>(IMailService);
    authRepository = module.get<IAuthRepository>(IAuthRepository);
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('validateUser', () => {
    it('should return null on error', async () => {
      jest.spyOn(userService, 'validateUser').mockRejectedValue('error');
      const result = await authService.validateUser('username', 'password');
      expect(result).toBe(null);
    });
    it('should return user', async () => {
      const user = plainToInstance(UserResponse, userGenerator());
      jest.spyOn(userService, 'validateUser').mockResolvedValue(user);
      const result = await authService.validateUser('username', 'password');
      expect(result).toStrictEqual(user);
    });
  });
  describe('login', () => {
    it('should return a TokenDto with an access and refresh token', async () => {
      const mockUser: any = {
        id: 1,
        username: 'testuser',
        role: 'user',
      };
      const access = 'mock-token';
      const refreshToken = 'uuid';
      jest.spyOn(jwtService, 'sign').mockReturnValue(access);
      jest.spyOn(uuid, 'v4').mockReturnValue(refreshToken);
      jest
        .spyOn(authRepository, 'findByUserId')
        .mockResolvedValue(userTokenGenerator());
      const userToken = userTokenGenerator({ token: 'token' });
      jest.spyOn(authRepository, 'update').mockResolvedValue(userToken);
      const result = await authService.login(mockUser);
      expect(uuid.v4).toBeCalled();
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 1,
        roles: ['user'],
      });
      expect(result).toEqual({
        access,
        refreshToken: userToken.token,
      });
    });
  });
  describe('signup', () => {
    const createUserPayload = plainToInstance(SignupDto, {
      birthday: new Date(),
      confirmPassword: 'senha',
      email: 'email@email.com',
      lastName: 'de Déxter',
      name: 'Laboratório',
      password: 'senha',
      username: 'username',
    });
    it('should throw service error', async () => {
      jest
        .spyOn(userService, 'create')
        .mockRejectedValue(new Error('ocorreu um erro'));
      await expect(authService.signup(createUserPayload)).rejects.toThrowError(
        new Error('ocorreu um erro'),
      );
      expect(jwtService.sign).not.toBeCalled();
    });
    it('should create user and return token', async () => {
      const user = plainToInstance(UserResponse, userGenerator());
      jest.spyOn(userService, 'create').mockResolvedValue(user);
      const access = 'mock-token';
      const refreshToken = 'uuid';
      jest.spyOn(jwtService, 'sign').mockReturnValue(access);
      const userToken = userTokenGenerator({ token: refreshToken });
      jest.spyOn(authRepository, 'create').mockResolvedValue(userToken);
      jest.spyOn(uuid, 'v4').mockReturnValue(refreshToken);
      const result = await authService.signup(createUserPayload);
      const expectedResponse = {
        access,
        refreshToken,
      };
      expect(result).toStrictEqual(expectedResponse);
    });
  });
  describe('refresh token', () => {
    const errorMessage = 'Você não pode realizar essa ação';
    const refreshToken = 'refresh';
    const access = 'access';
    beforeEach(() => {
      jest.spyOn(jwtService, 'decode').mockReturnValue({ sub: 1 });
    });

    it('should throw unauthorized when user has no token', async () => {
      jest.spyOn(authRepository, 'findByUserId').mockResolvedValue(null);

      await expect(
        authService.refreshToken({ refreshToken }, access),
      ).rejects.toThrowError(
        new HttpException(errorMessage, HttpStatus.UNAUTHORIZED),
      );
    });
    it('should throw unauthorized when expired token', async () => {
      jest.spyOn(authRepository, 'findByUserId').mockResolvedValue(
        userTokenGenerator({
          expiresIn: moment().subtract(1, 'days').toDate(),
        }),
      );
      await expect(
        authService.refreshToken({ refreshToken }, access),
      ).rejects.toThrowError(
        new HttpException(errorMessage, HttpStatus.UNAUTHORIZED),
      );
    });
    it('should throw unauthorized when is not same token', async () => {
      jest.spyOn(authRepository, 'findByUserId').mockResolvedValue(
        userTokenGenerator({
          expiresIn: moment().add(1, 'days').toDate(),
          token: 'another-token',
        }),
      );
      await expect(
        authService.refreshToken({ refreshToken }, access),
      ).rejects.toThrowError(
        new HttpException(errorMessage, HttpStatus.UNAUTHORIZED),
      );
    });
    it('should update old token', async () => {
      jest.spyOn(authRepository, 'findByUserId').mockResolvedValue(
        userTokenGenerator({
          expiresIn: moment().add(1, 'days').toDate(),
          token: refreshToken,
        }),
      );
      const newUserToken = userTokenGenerator();
      jest.spyOn(authRepository, 'update').mockResolvedValue(newUserToken);
      jest.spyOn(uuid, 'v4').mockReturnValue(refreshToken);
      jest.spyOn(jwtService, 'sign').mockReturnValue(access);
      const result = await authService.refreshToken({ refreshToken }, access);
      expect(authRepository.update).toBeCalled();
      expect(result).toStrictEqual({
        access,
        refreshToken: newUserToken.token,
      });
    });
  });
  describe('reset password', () => {
    const user = plainToInstance(UserResponse, userGenerator());
    const body = { email: 'email@email.com' };
    const resetCode = resetPasswordCodeGenerator();
    const hashedEmail = 'email-hasheado';
    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedEmail);
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);
      jest
        .spyOn(securityCodeService, 'createCode')
        .mockResolvedValue(resetCode);
    });
    it('should throw user not found', async () => {
      jest
        .spyOn(userService, 'findByEmail')
        .mockRejectedValue(
          new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND),
        );
      await expect(authService.resetPassword(body)).rejects.toThrowError(
        new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND),
      );
      expect(securityCodeService.createCode).not.toBeCalled();
      expect(mailService.resetPassword).not.toBeCalled();
    });

    it('should send reset password email', async () => {
      const result = await authService.resetPassword(body);
      expect(securityCodeService.createCode).toBeCalledWith(user.id);
      expect(mailService.resetPassword).toBeCalledWith(user, resetCode.code);
      expect(result).toStrictEqual(new ResetPasswordResponseDto(hashedEmail));
    });
  });
  describe('confirm reset code', () => {
    const resetPasswordCode = {
      ...resetPasswordCodeGenerator(),
      user: userGenerator(),
    };

    it("throws invalid code when email hash doesn't matches", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      jest
        .spyOn(securityCodeService, 'findByCode')
        .mockResolvedValue(resetPasswordCode),
        await expect(
          authService.confirmCode({ code, email: 'hashed' }),
        ).rejects.toThrowError(
          new HttpException('Código inválido', HttpStatus.BAD_REQUEST),
        );
      expect(bcrypt.compare).toBeCalledWith(
        resetPasswordCode.user.email,
        'hashed',
      );
    });
    it('should confirm code', async () => {
      const { user } = resetPasswordCode;
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');
      jest
        .spyOn(securityCodeService, 'findByCode')
        .mockResolvedValue(resetPasswordCode);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await authService.confirmCode({ code, email: 'hashed' });
      expect(result).toStrictEqual({ access: 'token' });
      expect(jwtService.sign).toBeCalledWith(
        {
          username: user.username,
          sub: user.id,
          roles: [user.role],
        },
        { expiresIn: '1h' },
      );
      expect(bcrypt.compare).toBeCalledWith(
        resetPasswordCode.user.email,
        'hashed',
      );
    });
  });
  describe('change password', () => {
    const requestUser: RequestUser = {
      id: 1,
      roles: [RoleEnum.user],
      username: 'username',
    };
    it('should throw user srevice error', async () => {
      jest
        .spyOn(userService, 'changePassword')
        .mockRejectedValue(new Error('Exception'));
      await expect(
        authService.changePassword(requestUser, {
          password: 'password',
          confirmPassword: 'confirmPassword',
        }),
      ).rejects.toThrowError(new Error('Exception'));
    });
    it('should change password and send email', async () => {
      const user = plainToInstance(UserResponse, userGenerator());
      jest.spyOn(mailService, 'passwordUpdated').mockResolvedValue();
      jest.spyOn(userService, 'changePassword').mockResolvedValue(user);

      await authService.changePassword(requestUser, {
        password: 'password',
        confirmPassword: 'password',
      });
      expect(mailService.passwordUpdated).toBeCalledWith(user);
    });
  });
});
