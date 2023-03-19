import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { UserResponse } from './dto/user-response.dto';
import { UserRepository } from './user-repository.service';

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async findById(id: number): Promise<UserResponse> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    return plainToClass(UserResponse, user);
  }
}
