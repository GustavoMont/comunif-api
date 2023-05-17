import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from './dto/user-response.dto';
import { UserUpdate } from './dto/user-update.dto';
import { IUserService } from './interfaces/IUserService';
import { UserRepository } from './user-repository.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SecurityCodeService } from 'src/security-code/security-code.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly securityCodeService: SecurityCodeService,
    private readonly mailService: MailService,
  ) {}
  async findByEmail(email: string): Promise<UserResponse> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }
    return plainToInstance(UserResponse, user);
  }
  async resetPassword(body: ResetPasswordDto): Promise<void> {
    const user = await this.findByEmail(body.email);
    const resetCode = await this.securityCodeService.createCode(user.id);
    await this.mailService.resetPassword(user, resetCode.code);
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
    const user = await this.repository.update(id, changes);
    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    return plainToInstance(UserResponse, user);
  }
}
