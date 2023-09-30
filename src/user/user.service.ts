import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from './dto/user-response.dto';
import { UserUpdate } from './dto/user-update.dto';
import { IUserService } from './interfaces/IUserService';
import { User } from 'src/models/User';
import * as bcrypt from 'bcrypt';
import { serviceConstants } from 'src/constants/service.constants';
import { Service } from 'src/utils/services';
import { ListResponse } from 'src/dtos/list.dto';
import { IUserRepository } from './interfaces/IUserRepository';
import { PasswordDto } from './dto/password.dto';
import { UserCreate } from './dto/user-create.dto';
import { RequestUser } from 'src/types/RequestUser';
import { DeactivateUser } from './dto/deactivate-user.dto';
import { IMailService } from 'src/mail/interfaces/IMailService';
@Injectable()
export class UserService extends Service implements IUserService {
  constructor(
    @Inject(IUserRepository) private readonly repository: IUserRepository,
    @Inject(IMailService) private readonly mailService: IMailService,
  ) {
    super();
  }
  async activate(userId: number, currentUser?: RequestUser): Promise<void> {
    if (!currentUser || !this.isAdmin(currentUser.roles[0])) {
      throw new ForbiddenException();
    }
    const user = await this.findById(userId);
    if (user.isActive) {
      throw new HttpException(
        'Esse usuário já está ativo',
        HttpStatus.BAD_REQUEST,
      );
    }
    await Promise.all([
      this.repository.update(user.id, { isActive: true }),
      this.mailService.activateUser(user),
    ]);
  }
  async deactivate(
    userId: number,
    { reason }: DeactivateUser,
    currentUser: RequestUser,
  ): Promise<void> {
    if (!this.isAdmin(currentUser.roles[0])) {
      throw new HttpException(
        'Você não tem permissão para executar essa ação',
        HttpStatus.FORBIDDEN,
      );
    }
    const user = await this.findById(userId);
    await Promise.all([
      this.repository.update(user.id, {
        isActive: false,
      }),
      this.mailService.deactivateUser(user, reason),
    ]);
  }
  async validateUser(
    username: string,
    password: string,
  ): Promise<UserResponse> {
    const user = await this.repository.findByUsername(username);

    if (!user) {
      throw new HttpException(
        'Usuário ou senha incorretos',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (!user.isActive) {
      throw new HttpException(
        'Essa conta está desativada no momento',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new HttpException(
        'Usuário ou senha incorretos',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return plainToInstance(UserResponse, user);
  }
  passwordMatches(password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new HttpException('Senhas não coincidem', HttpStatus.BAD_REQUEST);
    }
  }
  async create(body: UserCreate, currentUser?: RequestUser): Promise<User> {
    this.passwordMatches(body.password, body.confirmPassword);
    const emailExists = await this.emailExists(body.email);
    if (emailExists) {
      throw new HttpException('E-mail já cadastrado', HttpStatus.BAD_REQUEST);
    }
    const usernameExists = await this.usernameExists(body.username);
    if (!!usernameExists) {
      throw new HttpException(
        'Username não disponível',
        HttpStatus.BAD_REQUEST,
      );
    }
    const isCreatingAdmin = this.isAdmin(body.role);
    const currentUserIsAdmin = this.isAdmin(currentUser?.roles[0]);
    if (isCreatingAdmin && !currentUserIsAdmin) {
      throw new HttpException(
        'Você não tem permissão para executar essa ação',
        HttpStatus.FORBIDDEN,
      );
    }
    delete body.confirmPassword;
    const changes = plainToInstance(User, body);
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await this.repository.create({
      ...changes,
      password: hashedPassword,
    });
    return plainToInstance(UserResponse, user);
  }
  async usernameExists(username: string): Promise<boolean> {
    const user = await this.repository.findByUsername(username);
    return !!user;
  }

  async changePassword(
    userId: number,
    body: PasswordDto,
  ): Promise<UserResponse> {
    if (body.password !== body.confirmPassword) {
      throw new HttpException('Senhas não coincidem', HttpStatus.BAD_REQUEST);
    }
    const userExists = await this.repository.findById(userId);
    if (!userExists) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    const user = await this.repository.update(userId, {
      password: await bcrypt.hash(body.password, 10),
    } as UserUpdate);
    return plainToInstance(UserResponse, user);
  }

  async emailExists(email: string): Promise<boolean> {
    return !!(await this.repository.findByEmail(email));
  }

  async findByEmail(email: string): Promise<UserResponse> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new HttpException('E-mail não encontrado', HttpStatus.NOT_FOUND);
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
      changes.avatar = `${process.env.DOMAIN}/${changes.avatar}`;
    }
    const user = await this.repository.update(id, changes);
    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    return plainToInstance(UserResponse, user);
  }
}
