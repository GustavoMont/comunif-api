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
} from 'src/utils/generators';
import { ResetPasswordResponseDto } from '../dto/reset-password.dto';
import { UserRepository } from 'src/user/user-repository.service';
import { RequestUser } from 'src/types/RequestUser';
import { RoleEnum } from 'src/models/User';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let securityCodeService: SecurityCodeService;
  let mailService: MailService;
  const code = '000001';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
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
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
    securityCodeService = module.get<SecurityCodeService>(SecurityCodeService);
    mailService = module.get<MailService>(MailService);
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
    it('should return a TokenDto with an access token', () => {
      const mockUser: any = {
        id: 1,
        username: 'testuser',
        role: 'user',
      };
      const mockToken = 'mock-token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      const result: TokenDto = authService.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 1,
        roles: ['user'],
      });
      expect(result.access).toEqual(mockToken);
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
      await expect(authService.signup(requestBody)).rejects.toThrowError(
        new HttpException('Username já está em uso', HttpStatus.BAD_REQUEST),
      );
      expect(spyFindByUsername).toBeCalledWith('existente');
      expect(userRepository.create).not.toBeCalled();
    });
    it('should return token for register user', async () => {
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
      jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockResolvedValue(mockUser);
      const sign = jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result: TokenDto = await authService.signup(requestBody);
      expect(result.access).toBe('token');
      expect(sign).toBeCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
        roles: ['user'],
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
