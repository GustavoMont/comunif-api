import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import {
  arrayGenerator,
  requestUserGenerator,
  userGenerator,
} from 'src/utils/generators';
import { UserResponse } from '../dto/user-response.dto';
import { UserService } from '../user.service';
import { SecurityCodeService } from 'src/security-code/security-code.service';
import { MailService } from 'src/mail/mail.service';
import { ListResponse } from 'src/dtos/list.dto';
import { IUserRepository } from '../interfaces/IUserRepository';
import * as bcrypt from 'bcrypt';
import { UserCreate } from '../dto/user-create.dto';
import { RoleEnum } from 'src/models/User';
import { IMailService } from 'src/mail/interfaces/IMailService';
import { UserQueryDto } from '../dto/user-query.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
describe('Teste USer Service', () => {
  let userService: UserService;
  let userRepository: IUserRepository;
  let mailService: IMailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: IUserRepository,
          useValue: {
            findByUsername: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
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
          provide: IMailService,
          useValue: {
            deactivateUser: jest.fn(),
            activateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<IUserRepository>(IUserRepository);
    mailService = module.get<IMailService>(IMailService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
  });
  describe('findAll', () => {
    it('should return list of users', async () => {
      const users = arrayGenerator(5, userGenerator);
      const total = 10;
      jest.spyOn(userRepository, 'count').mockResolvedValue(total);
      jest.spyOn(userRepository, 'findAll').mockResolvedValue(users);
      const result = await userService.findAll(1, 5);
      const usersResponse = plainToInstance(UserResponse, users);
      expect(result).toStrictEqual(
        new ListResponse(usersResponse, total, 1, 5),
      );
    });
    it('should filter users', async () => {
      const users = arrayGenerator(5, userGenerator);
      const total = 10;
      const query: UserQueryDto = {
        isActive: false,
      };
      jest.spyOn(userRepository, 'count').mockResolvedValue(total);
      jest.spyOn(userRepository, 'findAll').mockResolvedValue(users);
      const result = await userService.findAll(1, 5, query);
      const usersResponse = plainToInstance(UserResponse, users);
      expect(result).toStrictEqual(
        new ListResponse(usersResponse, total, 1, 5),
      );
      expect(userRepository.count).toBeCalledWith(query);
      expect(userRepository.findAll).toBeCalledWith(
        { take: 5, skip: 0 },
        query,
      );
    });
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
  describe('validate user', () => {
    it('should throw unauthorized exception when user not found', async () => {
      jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(null);
      await expect(
        userService.validateUser('username', 'password'),
      ).rejects.toThrowError(
        new HttpException(
          'Usuário ou senha incorretos',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });
    it('should throw unauthorized exception when password is wrong', async () => {
      jest
        .spyOn(userRepository, 'findByUsername')
        .mockResolvedValue(userGenerator());
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      await expect(
        userService.validateUser('username', 'password'),
      ).rejects.toThrowError(
        new HttpException(
          'Usuário ou senha incorretos',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });
    it('should throw unauthorized to deactivated user', async () => {
      const user = userGenerator({ isActive: false });
      jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(user);
      await expect(
        userService.validateUser('username', 'password'),
      ).rejects.toThrowError(
        new HttpException(
          'Essa conta está desativada no momento',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });
    it('should return user', async () => {
      const user = userGenerator();
      jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      const result = await userService.validateUser('username', 'password');
      expect(result).toStrictEqual(plainToInstance(UserResponse, user));
    });
  });
  describe('change password', () => {
    it('should throw password does not match exception', async () => {
      await expect(
        userService.changePassword(1, {
          confirmPassword: 'senha',
          password: 'senho',
        }),
      ).rejects.toThrowError(
        new HttpException('Senhas não coincidem', HttpStatus.BAD_REQUEST),
      );
    });
    it('should throw user not found', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);
      await expect(
        userService.changePassword(1, {
          confirmPassword: 'senha',
          password: 'senha',
        }),
      ).rejects.toThrowError(
        new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND),
      );
    });
    it('should change password', async () => {
      const user = userGenerator();
      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);
      jest.spyOn(userRepository, 'update').mockResolvedValue(user);
      const newPassword = 'nova-senha';
      const newPasswordHashed = 'nova-senha-hashed';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(newPasswordHashed as never);
      const result = await userService.changePassword(1, {
        confirmPassword: newPassword,
        password: newPassword,
      });
      expect(bcrypt.hash).toBeCalledWith(newPassword, 10);
      expect(userRepository.update).toBeCalledWith(1, {
        password: newPasswordHashed,
      });
      expect(result).toStrictEqual(plainToInstance(UserResponse, user));
    });
  });
  describe('create', () => {
    const createUserPayload = plainToInstance(UserCreate, {
      birthday: new Date(),
      confirmPassword: 'senha',
      email: 'email@email.com',
      lastName: 'Maffoo',
      name: 'Zuboo',
      password: 'senha',
      username: 'username',
    });
    it('should throw passwords does not match exception', async () => {
      await expect(
        userService.create({
          ...createUserPayload,
          confirmPassword: 'senha errada',
        }),
      ).rejects.toThrowError(
        new HttpException('Senhas não coincidem', HttpStatus.BAD_REQUEST),
      );
      expect(userRepository.findByEmail).not.toBeCalled();
      expect(userRepository.findByUsername).not.toBeCalled();
    });
    it('should throw email already exists exception', async () => {
      jest
        .spyOn(userRepository, 'findByEmail')
        .mockResolvedValue(userGenerator());
      await expect(userService.create(createUserPayload)).rejects.toThrowError(
        new HttpException('E-mail já cadastrado', HttpStatus.BAD_REQUEST),
      );
      expect(userRepository.findByEmail).toBeCalledWith(
        createUserPayload.email,
      );
      expect(userRepository.findByUsername).not.toBeCalled();
    });
    it('should throw username already exists exception', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(userRepository, 'findByUsername')
        .mockResolvedValue(userGenerator());
      await expect(userService.create(createUserPayload)).rejects.toThrowError(
        new HttpException('Username não disponível', HttpStatus.BAD_REQUEST),
      );
      expect(userRepository.findByEmail).toBeCalledWith(
        createUserPayload.email,
      );
      expect(userRepository.findByUsername).toBeCalledWith(
        createUserPayload.username,
      );
    });
    it('should throw forbidden when user try create an admin user', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(null);
      const currentUser = requestUserGenerator({
        roles: [RoleEnum.user],
      });
      await expect(
        userService.create(
          { ...createUserPayload, role: RoleEnum.admin },
          currentUser,
        ),
      ).rejects.toThrowError(
        new HttpException(
          'Você não tem permissão para executar essa ação',
          HttpStatus.FORBIDDEN,
        ),
      );
    });
    it('should create user', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(null);
      const user = userGenerator();
      jest.spyOn(userRepository, 'create').mockResolvedValue(user);
      const hashedPassword = 'hashed-password';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      const payload = { ...createUserPayload };
      const result = await userService.create(payload);
      expect(result).toStrictEqual(plainToInstance(UserResponse, user));
      expect(bcrypt.hash).toBeCalledWith(createUserPayload.password, 10);

      expect(userRepository.create).toBeCalledWith({
        ...payload,
        password: hashedPassword,
      });
    });
    it('should create admin user', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(null);
      const user = userGenerator();
      jest.spyOn(userRepository, 'create').mockResolvedValue(user);
      const hashedPassword = 'hashed-password';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      const payload = { ...createUserPayload, role: RoleEnum.admin };
      const admin = requestUserGenerator({ roles: [RoleEnum.admin] });
      const result = await userService.create(payload, admin);
      expect(result).toStrictEqual(plainToInstance(UserResponse, user));
      expect(bcrypt.hash).toBeCalledWith(createUserPayload.password, 10);
      expect(userRepository.create).toBeCalledWith({
        ...payload,
        password: hashedPassword,
      });
    });
  });
  describe('deactivate user', () => {
    it('should throw user not found exception', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);
      const admin = requestUserGenerator({ roles: [RoleEnum.admin] });
      await expect(
        userService.deactivate(1, { reason: 'sim' }, admin),
      ).rejects.toThrowError(
        new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND),
      );
    });
    it('should throw forbidden exception', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(userGenerator());
      await expect(
        userService.deactivate(
          1,
          { reason: 'sim' },
          requestUserGenerator({ roles: [RoleEnum.user] }),
        ),
      ).rejects.toThrowError(
        new HttpException(
          'Você não tem permissão para executar essa ação',
          HttpStatus.FORBIDDEN,
        ),
      );
    });
    it('should deactivate user and send e-mail', async () => {
      const user = userGenerator();
      const admin = requestUserGenerator({ roles: [RoleEnum.admin] });
      const reason = 'você foi banido porque você é um jão';
      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);
      const userResponse = plainToInstance(UserResponse, user);
      await userService.deactivate(user.id, { reason }, admin);
      expect(userRepository.update).toBeCalledWith(user.id, {
        isActive: false,
      });
      expect(mailService.deactivateUser).toBeCalledWith(userResponse, reason);
    });
  });
  describe('activate user', () => {
    const admin = requestUserGenerator({ roles: [RoleEnum.admin] });
    it('should throw forbidden exception', async () => {
      await expect(userService.activate(1)).rejects.toThrowError(
        new HttpException('Forbidden', HttpStatus.FORBIDDEN),
      );
    });
    it('should throw user not found exception', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);
      await expect(
        userService.deactivate(1, { reason: 'sim' }, admin),
      ).rejects.toThrowError(
        new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND),
      );
    });
    it('should throw user already active exception', async () => {
      const user = userGenerator({ isActive: true });
      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);
      await expect(userService.activate(1, admin)).rejects.toThrowError(
        new HttpException('Esse usuário já está ativo', HttpStatus.BAD_REQUEST),
      );
    });
    it('should activate user and send e-mail', async () => {
      const user = userGenerator({ isActive: false });
      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);
      await userService.activate(user.id, admin);
      expect(userRepository.update).toBeCalledWith(user.id, {
        isActive: true,
      });

      expect(mailService.activateUser).toBeCalledWith(
        plainToInstance(UserResponse, user),
      );
    });
  });
});
