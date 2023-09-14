import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from './dto/user-response.dto';
import { UserUpdate } from './dto/user-update.dto';
import { IUserService } from './interfaces/IUserService';
import { User } from 'src/models/User';
import * as bcrypt from 'bcrypt';
import { env } from 'src/constants/env';
import { PasswordDto } from 'src/auth/dto/password.dto';
import { serviceConstants } from 'src/constants/service.constants';
import { Service } from 'src/utils/services';
import { ListResponse } from 'src/dtos/list.dto';
import { IUserRepository } from './interfaces/IUserRepository';
@Injectable()
export class UserService extends Service implements IUserService {
  constructor(
    @Inject(IUserRepository) private readonly repository: IUserRepository,
  ) {
    super();
  }
  async create(user: User): Promise<User> {
    const newUser = await this.repository.create(user);
    return newUser as User;
  }
  async findByUsername(
    username: string,
    getPassword = false,
  ): Promise<UserResponse> {
    const user = await this.repository.findByUsername(username);
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }
    return plainToInstance(getPassword ? User : UserResponse, user);
  }

  async changePassword(userId: number, body: PasswordDto): Promise<void> {
    if (body.password !== body.confirmPassword) {
      throw new HttpException('Senhas não coincidem', HttpStatus.BAD_REQUEST);
    }
    await this.repository.update(userId, {
      password: await bcrypt.hash(body.password, 10),
    } as UserUpdate);
  }

  async emailExists(email: string): Promise<boolean> {
    return !!(await this.repository.findByEmail(email));
  }

  async findByEmail(email: string): Promise<UserResponse> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }
    return plainToInstance(UserResponse, user);
  }

  async findById(id: number): Promise<UserResponse> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    return plainToInstance(UserResponse, user);
  }
  async findAll(
    page = 1,
    take = serviceConstants.take,
  ): Promise<ListResponse<UserResponse>> {
    const skip = this.generateSkip(page, take);
    const [users, total] = await Promise.all([
      this.repository.findAll({ skip, take }),
      this.repository.count(),
    ]);
    const userResponse = plainToInstance(UserResponse, users);
    return new ListResponse(userResponse, total, page, take);
  }
  async update(id: number, changes: UserUpdate): Promise<UserResponse> {
    if (changes.username) {
      const usernameExists = await this.repository.findByUsername(
        changes.username,
      );
      if (usernameExists && usernameExists.id !== id) {
        throw new HttpException('Username já em uso', HttpStatus.BAD_REQUEST);
      }
    }
    delete changes.password;
    if (changes.avatar) {
      changes.avatar = `${env.domain}/${changes.avatar}`;
    }
    const user = await this.repository.update(id, changes);
    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    return plainToInstance(UserResponse, user);
  }
}
