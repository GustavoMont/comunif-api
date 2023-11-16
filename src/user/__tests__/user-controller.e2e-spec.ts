import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserModule } from '../user.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserResponse } from '../dto/user-response.dto';
import users from '../../../prisma/fixtures/users';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ListResponse } from 'src/dtos/list.dto';
import { UserCreate } from '../dto/user-create.dto';
import { RoleEnum } from 'src/models/User';
import { IMailService } from 'src/mail/interfaces/IMailService';

describe('Users', () => {
  const BASE_URL = '/api/users';
  let token: string;
  let adminToken: string;
  let app: INestApplication;
  const user = users.find(({ username }) => username === 'editavel');
  const activeUser = users.find(({ username }) => username === 'ativado');
  const deactivateUser = users.find(
    ({ username }) => username === 'desativado',
  );
  const admin = users.find(({ username }) => username === 'admin');
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, AuthModule],
      providers: [],
    })
      .overrideProvider(IMailService)
      .useValue({
        deactivateUser: jest.fn(),
        activateUser: jest.fn(),
      })

      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    await app.init();
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: user.username, password: '12345678S' })
      .expect(201);
    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: admin.username, password: '4dminSenha' })
      .expect(201);
    token = loginRes.body.access;
    adminToken = adminLogin.body.access;
  });

  describe('/GET', () => {
    it('should return user', async () => {
      return request(app.getHttpServer())
        .get(`/api/users/${user.id}`)
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .expect(instanceToPlain(plainToInstance(UserResponse, user)));
    });
    it('should return list of user response', async () => {
      const usersResponse = plainToInstance(UserResponse, users);
      return request(app.getHttpServer())
        .get('/api/users/')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .expect(
          instanceToPlain(new ListResponse(usersResponse, users.length, 1, 20)),
        );
    });
    it('should throw unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/users/10')
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        });
      return request(app.getHttpServer()).get('/api/users').expect(401).expect({
        statusCode: 401,
        message: 'Unauthorized',
      });
    });
  });
  describe('/POST', () => {
    describe('Create user', () => {
      let userId: number;
      const adminPayload: UserCreate = plainToInstance(UserCreate, {
        birthday: new Date('1999-01-01'),
        confirmPassword: '12345678S',
        email: 'naousado@email.com',
        lastName: 'Cléber',
        name: 'Adminelson',
        password: '12345678S',
        role: RoleEnum.admin,
        username: 'administro',
      } as UserCreate);
      beforeAll(() => {
        return request(app.getHttpServer())
          .patch(`${BASE_URL}/${userId}/deactivate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            reason: 'Usuário deve ser visível só no test',
          });
      });
      it('should throw unauthorized exception', async () => {
        return request(app.getHttpServer())
          .post(BASE_URL)
          .send({})
          .expect(401)
          .expect({
            statusCode: 401,
            message: 'Unauthorized',
          });
      });
      it('should throw bad request exception', async () => {
        return request(app.getHttpServer())
          .post(BASE_URL)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400)
          .expect({
            statusCode: 400,
            message: [
              'Nome é um campo obrigatório',
              'Sobrenomeome é um campo obrigatório',
              'Informe um e-mail válido',
              'username é um campo obrigatório',
              'Idade mínima de 15 anos',
              'A senha deve ter no mínimo 8 caracteres, conter uma letra e um número',
            ],
            error: 'Bad Request',
          });
      });
      it('should throw passwords does not match', async () => {
        return request(app.getHttpServer())
          .post(BASE_URL)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...adminPayload,
            confirmPassword: 'top10senhas',
          })
          .expect(400)
          .expect({ statusCode: 400, message: 'Senhas não coincidem' });
      });
      it('should throw e-mail already exists', async () => {
        return request(app.getHttpServer())
          .post(BASE_URL)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...adminPayload,
            email: user.email,
          })
          .expect(400)
          .expect({
            statusCode: 400,
            message: 'E-mail já cadastrado',
          });
      });
      it('should throw e-mail username already exists', async () => {
        return request(app.getHttpServer())
          .post(BASE_URL)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...adminPayload,
            username: user.username,
          })
          .expect(400)
          .expect({
            statusCode: 400,
            message: 'Username não disponível',
          });
      });
      it('should throw forbidden exception', async () => {
        return request(app.getHttpServer())
          .post(BASE_URL)
          .set('Authorization', `Bearer ${token}`)
          .send(adminPayload)
          .expect(403)
          .expect({
            statusCode: 403,
            message: 'Forbidden resource',
            error: 'Forbidden',
          });
      });
      it('should create another admin', async () => {
        return request(app.getHttpServer())
          .post(BASE_URL)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(adminPayload)
          .expect(201)
          .then(({ body }) => {
            userId = body.id;
          });
      });
    });
  });
  describe('/PATCH', () => {
    describe('update user', () => {
      afterAll(async () => {
        return await request(app.getHttpServer())
          .patch(`/api/users/${user.id}`)
          .set('Authorization', 'Bearer ' + token)
          .send(user)
          .expect(200);
      });
      it('should throw unauthorized', async () => {
        return request(app.getHttpServer())
          .patch('/api/users/1')
          .expect(401)
          .expect({
            statusCode: 401,
            message: 'Unauthorized',
          });
      });
      it('should throw forbidden', async () => {
        return request(app.getHttpServer())
          .patch('/api/users/100')
          .set('Authorization', 'Bearer ' + token)
          .expect(403)
          .expect({
            statusCode: 403,
            message: 'Você não tem permissão para isso',
          });
      });
      it('should update user', async () => {
        const changes = {
          name: 'novo',
          lastName: 'editado',
          username: 'outro_username',
          bio: 'uma bio',
        };
        await request(app.getHttpServer())
          .patch(`/api/users/${user.id}`)
          .set('Authorization', 'Bearer ' + token)
          .send(changes)
          .expect(200);
        return request(app.getHttpServer())
          .get(`/api/users/${user.id}`)
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .send({
            ...user,
            ...changes,
          });
      });
    });
    describe('deactivate user', () => {
      afterAll(() => {
        return request(app.getHttpServer())
          .patch(`/api/users/${activeUser.id}/activate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);
      });
      it('should throw unauthorized', async () => {
        return request(app.getHttpServer())
          .patch(`/api/users/${activeUser.id}/deactivate`)
          .expect(401)
          .expect({
            statusCode: 401,
            message: 'Unauthorized',
          });
      });
      it('should throw forbidden', async () => {
        return request(app.getHttpServer())
          .patch(`/api/users/${activeUser.id}/deactivate`)
          .set('Authorization', `Bearer ${token}`)
          .expect(403)
          .expect({
            statusCode: 403,
            message: 'Forbidden resource',
            error: 'Forbidden',
          });
      });
      it('should throw bad request', async () => {
        return request(app.getHttpServer())
          .patch(`/api/users/${activeUser.id}/deactivate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ reason: 'oi' })
          .expect(400)
          .expect({
            statusCode: 400,
            message: ['Insira uma mensagem mais detalhada'],
            error: 'Bad Request',
          });
      });
      it('should deactivate user', async () => {
        await request(app.getHttpServer())
          .patch(`/api/users/${activeUser.id}/deactivate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            reason: 'Então você foi banido por blablablablablablablablabla',
          })
          .expect(204);
        return request(app.getHttpServer())
          .get(`/api/users/${activeUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .then(({ body }) => expect(body.isActive).toBeFalsy());
      });
    });
    describe('activate user', () => {
      afterAll(() => {
        return request(app.getHttpServer())
          .patch(`/api/users/${deactivateUser.id}/deactivate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            reason: 'Então você foi banido por blablablablablablablablabla',
          })
          .expect(204);
      });
      it('should throw unauthorized', async () => {
        return request(app.getHttpServer())
          .patch(`/api/users/${deactivateUser.id}/activate`)
          .expect(401)
          .expect({
            statusCode: 401,
            message: 'Unauthorized',
          });
      });
      it('should throw forbidden', async () => {
        return request(app.getHttpServer())
          .patch(`/api/users/${deactivateUser.id}/activate`)
          .set('Authorization', `Bearer ${token}`)
          .expect(403)
          .expect({
            statusCode: 403,
            message: 'Forbidden resource',
            error: 'Forbidden',
          });
      });
      it('should throw bad request', async () => {
        return request(app.getHttpServer())
          .patch(`/api/users/${user.id}/activate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ reason: 'oi' })
          .expect(400)
          .expect({
            statusCode: 400,
            message: 'Esse usuário já está ativo',
          });
      });
      it('should activate user', async () => {
        await request(app.getHttpServer())
          .patch(`/api/users/${deactivateUser.id}/activate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);
        return request(app.getHttpServer())
          .get(`/api/users/${deactivateUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .then(({ body }) => {
            expect(body.isActive).toBeTruthy();
          });
      });
    });
  });
});
