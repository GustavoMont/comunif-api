import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { userGenerator } from 'src/utils/generators';
import { UserResponse } from '../dto/user-response.dto';
import { UserRepository } from '../user-repository.service';
import { UserService } from '../user.service';

describe('Teste USer Service', () => {
  let userService: UserService;
  let userRepository: UserRepository;

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
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
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
});
