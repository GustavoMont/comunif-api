import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { TokenDto } from '../dto/token-dto';
import { SignupDto } from '../dto/sign-up.dto';
import { SecurityCodeService } from 'src/security-code/security-code.service';
import { MailService } from 'src/mail/mail.service';
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
import { AuthRepository } from '../auth.repository.service';
import * as moment from 'moment';
import { IUserRepository } from 'src/user/interfaces/IUserRepository';
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: AuthRepository;
  let userRepository: IUserRepository;
  let jwtService: JwtService;
  let securityCodeService: SecurityCodeService;
  let mailService: MailService;
  const code = '000001';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: IUserRepository,
          useValue: {
            findByUsername: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
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
          provide: SecurityCodeService,
          useValue: {
            createCode: jest.fn(),
            findByCode: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            resetPassword: jest.fn(),
            passwordUpdated: jest.fn(),
          },
        },
        {
          provide: AuthRepository,
          useValue: {
            findByUserId: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<IUserRepository>(IUserRepository);
    jwtService = module.get<JwtService>(JwtService);
    securityCodeService = module.get<SecurityCodeService>(SecurityCodeService);
    mailService = module.get<MailService>(MailService);
    authRepository = module.get<AuthRepository>(AuthRepository);
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('validateUser', () => {
    it('should return user if validation is successful', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const mockUser: any = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('testpassword', 10),
        birthday: new Date('1990-01-01'),
      };
      const spyFindByUsername = jest
        .spyOn(userRepository, 'findByUsername')
        .mockResolvedValue(mockUser);

      const result = await authService.validateUser('testuser', 'testpassword');

      expect(spyFindByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      const spyFindByUsername = jest
        .spyOn(userRepository, 'findByUsername')
        .mockResolvedValue(null);

      const result = await authService.validateUser('testuser', 'testpassword');

      expect(spyFindByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const mockUser: any = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('testpassword', 10),
        birthday: new Date('1990-01-01'),
      };
      const spyFindByUsername = jest
        .spyOn(userRepository, 'findByUsername')
        .mockResolvedValue(mockUser);

      const result = await authService.validateUser(
        'testuser',
        'wrongpassword',
      );

      expect(spyFindByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toBeNull();
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
    it('should throw error when passwords do not match', async () => {
      const requestBody: SignupDto = {
        birthday: new Date(),
        confirmPassword: '1234',
        email: 'top10 emails',
        lastName: 'last name',
        name: 'name',
        password: '4321',
        username: 'username',
      };
      await expect(authService.signup(requestBody)).rejects.toThrowError(
        new HttpException('Senhas não coincidem', HttpStatus.BAD_REQUEST),
      );
      expect(userRepository.create).not.toBeCalled();
    });
    it('should throw error when email already registered', async () => {
      const mockUser: any = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('testpassword', 10),
        birthday: new Date('1990-01-01'),
      };
      const spyFindByEmail = jest
        .spyOn(userRepository, 'findByEmail')
        .mockResolvedValue(mockUser);

      const requestBody: SignupDto = {
        birthday: new Date(),
        confirmPassword: '1234',
        email: 'existente',
        lastName: 'last name',
        name: 'name',
        password: '1234',
        username: 'username',
      };
      await expect(authService.signup(requestBody)).rejects.toThrowError(
        new HttpException('E-mail já cadastrado', HttpStatus.BAD_REQUEST),
      );
      expect(spyFindByEmail).toBeCalledWith('existente');
      expect(userRepository.create).not.toBeCalled();
    });
    it('should throw error when username already registered', async () => {
      const mockUser: any = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('testpassword', 10),
        birthday: new Date('1990-01-01'),
      };
      const spyFindByUsername = jest
        .spyOn(userRepository, 'findByUsername')
        .mockResolvedValue(mockUser);

      const requestBody: SignupDto = {
        birthday: new Date(),
        confirmPassword: '1234',
        email: 'existente',
        lastName: 'last name',
        name: 'name',
        password: '1234',
        username: 'existente',
      };
      jest.spyOn(authRepository, 'findByUserId').mockResolvedValue(null);
      await expect(authService.signup(requestBody)).rejects.toThrowError(
        new HttpException('Username já está em uso', HttpStatus.BAD_REQUEST),
      );
      expect(spyFindByUsername).toBeCalledWith('existente');
      expect(userRepository.create).not.toBeCalled();
    });
    it('should return access and refresh token for register user', async () => {
      const requestBody: SignupDto = {
        birthday: new Date(),
        confirmPassword: '1234',
        email: 'existente',
        lastName: 'last name',
        name: 'name',
        password: '1234',
        username: 'existente',
      };
      const mockUser: any = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('testpassword', 10),
        birthday: new Date('1990-01-01'),
        role: 'user',
      };
      const access = 'token';
      const refreshToken = 'uuid';
      jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockResolvedValue(mockUser);
      const userToken = userTokenGenerator({ token: 'token' });
      jest.spyOn(authRepository, 'create').mockResolvedValue(userToken);
      jest.spyOn(uuid, 'v4').mockReturnValue(refreshToken);

      const sign = jest.spyOn(jwtService, 'sign').mockReturnValue(access);

      const result: TokenDto = await authService.signup(requestBody);
      expect(result).toStrictEqual({
        access,
        refreshToken: userToken.token,
      });
      expect(sign).toBeCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
        roles: ['user'],
      });
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
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user);
      jest
        .spyOn(securityCodeService, 'createCode')
        .mockResolvedValue(resetCode);
    });
    it('should throw user not found', async () => {
      jest
        .spyOn(userRepository, 'findByEmail')
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
    it('should throw passwords do not match', async () => {
      await expect(
        authService.changePassword(requestUser, {
          password: 'password',
          confirmPassword: 'confirmPassword',
        }),
      ).rejects.toThrowError(
        new HttpException('Senhas não coincidem', HttpStatus.BAD_REQUEST),
      );
    });
    it('should change password and send email', async () => {
      const user = userGenerator();
      jest.spyOn(mailService, 'passwordUpdated').mockResolvedValue();
      jest.spyOn(userRepository, 'update').mockResolvedValue(user);

      await authService.changePassword(requestUser, {
        password: 'password',
        confirmPassword: 'password',
      });

      expect(userRepository.update).toBeCalled();
      expect(mailService.passwordUpdated).toBeCalledWith(user);
    });
  });
});
