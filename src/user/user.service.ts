import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from './dto/user-response.dto';
import { UserUpdate } from './dto/user-update.dto';
import { IUserService } from './interfaces/IUserService';
import { UserRepository } from './user-repository.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SecurityCodeService } from 'src/security-code/security-code.service';
import { MailService } from 'src/mail/mail.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/models/User';
@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly securityCodeService: SecurityCodeService,
    private readonly mailService: MailService,
  ) {}
  async changePassword(body: UpdatePasswordDto): Promise<void> {
    const resetCode = await this.securityCodeService.findByCode(body.code);
    if (body.password !== body.confirmPassword) {
      throw new HttpException('Senhas não coincidem', HttpStatus.BAD_REQUEST);
    }
    const user = await this.repository.update(resetCode.userId, {
      password: await bcrypt.hash(body.password, 10),
    });
    await this.mailService.passwordUpdated(user as User);
  }
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
