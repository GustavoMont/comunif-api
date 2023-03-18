import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UserRepository } from 'src/user/user-repository.service';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { SignupDto } from '../dto/sign-up.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
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

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should create a new user and return a token', async () => {
      const signUpDto: SignupDto = {
        name: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        username: 'johndoe',
        password: 'password',
        birthday: new Date('2000-01-01'),
        confirmPassword: 'password',
      };

      jest.spyOn(authService, 'signup').mockResolvedValue({
        access: 'jwt_token',
      });

      const result = await authController.signup(signUpDto);

      expect(authService.signup).toHaveBeenCalledWith(signUpDto);
      expect(result).toEqual({ access: 'jwt_token' });
    });
  });
});
