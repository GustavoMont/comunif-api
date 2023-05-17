import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import {
  resetPasswordCodeGenerator,
  userGenerator,
} from 'src/utils/generators';
import { UserResponse } from '../dto/user-response.dto';
import { UserRepository } from '../user-repository.service';
import { UserService } from '../user.service';
import { SecurityCodeService } from 'src/security-code/security-code.service';
import { MailService } from 'src/mail/mail.service';

describe('Teste USer Service', () => {
  let userService: UserService;
  let userRepository: UserRepository;
  let securityCodeService: SecurityCodeService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findByUsername: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: SecurityCodeService,
          useValue: {
            createCode: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            resetPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    securityCodeService = module.get<SecurityCodeService>(SecurityCodeService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
  });
  describe('get by id', () => {
    it('should throw not found exception', async () => {
      jest.spyOn(userRepository, 'findById').mockReturnValue(null);
      await expect(userService.findById(10)).rejects.toThrowError(
        new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND),
      );
    });
    it('should return correct user', async () => {
      const user: User = userGenerator();
      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);
      const result = await userService.findById(1);
      expect(plainToInstance(UserResponse, result)).toEqual(
        plainToInstance(UserResponse, user),
      );
    });
  });
  describe('update user', () => {
    it('should throw exist username error', async () => {
      jest
        .spyOn(userRepository, 'findByUsername')
        .mockResolvedValue(userGenerator({ username: 'username' }));
      await expect(
        userService.update(10, { username: 'username' } as any),
      ).rejects.toThrowError(
        new HttpException('Username já em uso', HttpStatus.NOT_FOUND),
      );
      expect(userRepository.update).not.toBeCalled();
    });
    it('should throw not found error', async () => {
      jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);
      await expect(
        userService.update(1, { username: 'username' } as any),
      ).rejects.toThrowError(
        new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND),
      );
    });
    it('should update user', async () => {
      jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(null);
      jest.spyOn(userRepository, 'update').mockResolvedValue(userGenerator());
      await expect(userService.update(1, {} as any)).resolves.toEqual(
        plainToInstance(UserResponse, userGenerator()),
      );
    });
    it('should allow update to current username', async () => {
      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValue(userGenerator({ id: 1 }));
      await expect(
        userService.update(1, { username: 'username' } as any),
      ).resolves.toEqual(plainToInstance(UserResponse, userGenerator()));
      expect(userRepository.findByUsername).toBeCalledWith('username');
    });
  });
  describe('reset password', () => {
    const user = plainToInstance(UserResponse, userGenerator());
    const body = { email: 'email@email.com' };
    const resetCode = resetPasswordCodeGenerator();
    beforeEach(() => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user);
      jest
        .spyOn(securityCodeService, 'createCode')
        .mockResolvedValue(resetCode);
    });
    it('should throw user not found', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);
      await expect(userService.resetPassword(body)).rejects.toThrowError(
        new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND),
      );
      expect(securityCodeService.createCode).not.toBeCalled();
      expect(mailService.resetPassword).not.toBeCalled();
    });

    it('should send reset password email', async () => {
      await userService.resetPassword(body);
      expect(securityCodeService.createCode).toBeCalledWith(user.id);
      expect(mailService.resetPassword).toBeCalledWith(user, resetCode.code);
    });
  });
});
