import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { UserRepository } from 'src/user/user-repository.service';
import { TokenDto } from '../dto/token-dto';
import { SignupDto } from '../dto/sign-up.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;

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
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user if validation is successful', async () => {
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
});
