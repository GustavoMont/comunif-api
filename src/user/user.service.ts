import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from './dto/user-response.dto';
import { UserUpdate } from './dto/user-update.dto';
import { IUserService } from './interfaces/IUserService';
import { UserRepository } from './user-repository.service';
import { User } from 'src/models/User';
import * as bcrypt from 'bcrypt';
import { env } from 'src/constants/env';
@Injectable()
export class UserService implements IUserService {
  constructor(private readonly repository: UserRepository) {}
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

  async changePassword(userId, body): Promise<void> {
    if (body.password !== body.confirmPassword) {
      throw new HttpException('Senhas não coincidem', HttpStatus.BAD_REQUEST);
    }
    await this.repository.update(userId, {
      password: await bcrypt.hash(body.password, 10),
    });
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
  async findAll(): Promise<UserResponse[]> {
    const users = await this.repository.findAll();
    return plainToInstance(UserResponse, users);
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
