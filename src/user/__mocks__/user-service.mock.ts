import { CountDto } from 'src/dtos/count.dto';
import { ListResponse } from 'src/dtos/list.dto';
import { RequestUser } from 'src/types/RequestUser';
import { DeactivateUser } from '../dto/deactivate-user.dto';
import { PasswordDto } from '../dto/password.dto';
import { UserCreate } from '../dto/user-create.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UserResponse } from '../dto/user-response.dto';
import { UserUpdate } from '../dto/user-update.dto';
import { IUserService } from '../interfaces/IUserService';

export const userServiceMock: IUserService = {
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  changePassword: jest.fn(),
  emailExists: jest.fn(),
  usernameExists: jest.fn(),
  validateUser: jest.fn(),
  deactivate: jest.fn(),
  activate: jest.fn(),
  count: jest.fn(),
};
