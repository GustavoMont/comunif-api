import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from './dto/user-response.dto';
import { IUserService } from './interfaces/IUserService';
import { UserRepository } from './user-repository.service';

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly repository: UserRepository) {}

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
}
