import { Test } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<UserController>(UserController);
    service = moduleRef.get<UserService>(UserService);
  });

  describe('findById', () => {
    it('should return a user by id when authenticated', async () => {
      const userId = 123;
      const expectedUser: any = {
        id: userId,
        name: 'John Doe',
        email: 'johndoe@example.com',
      };
      jest.spyOn(service, 'findById').mockResolvedValue(expectedUser);
      const result = await controller.findById(userId);

      expect(result).toBe(expectedUser);
      expect(service.findById).toHaveBeenCalledWith(userId);
    });
  });
});
