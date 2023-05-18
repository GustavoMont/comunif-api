import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserModule } from '../user.module';
import { UserService } from '../user.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserResponse } from '../dto/user-response.dto';
import users from '../../../prisma/fixtures/users';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { SecurityCodeModule } from 'src/security-code/security-code.module';
import { MailService } from 'src/mail/mail.service';

describe('Users', () => {
  let token: string;
  let app: INestApplication;
  const user = users.find(({ username }) => username === 'editavel');
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, AuthModule, SecurityCodeModule],
      providers: [
        UserService,
        {
          provide: MailService,
          useValue: {
            resetPassword: jest.fn(),
          },
        },
      ],
    }).compile();

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
    token = loginRes.body.access;
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
      return request(app.getHttpServer())
        .get('/api/users/')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .expect(instanceToPlain(plainToInstance(UserResponse, users)));
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
  describe('/PATCH', () => {
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
  describe('/POST', () => {
    describe('Reset password', () => {
      it('should throw bad request', async () => {
        return await request(app.getHttpServer())
          .post('/api/users/reset-password')
          .send({ email: 'robson' })
          .expect(400)
          .expect({
            statusCode: 400,
            message: ['Insira um e-mail válido'],
            error: 'Bad Request',
          });
      });
      it('should return user not found', async () => {
        return await request(app.getHttpServer())
          .post('/api/users/reset-password')
          .send({ email: 'robson@email.com' })
          .expect(404)
          .expect({
            statusCode: 404,
            message: 'Usuário não encontrado.',
          });
      });
      it('should return success empty', async () => {
        return await request(app.getHttpServer())
          .post('/api/users/reset-password')
          .send({ email: user.email })
          .expect(204);
      });
    });
    describe('Change password', () => {
      describe('bad requests', () => {
        it('weak passwords and invalid code', async () => {
          return await request(app.getHttpServer())
            .post('/api/users/change-password')
            .send({ code: 'robsona', password: 'a', confirmPassword: 'b' })
            .expect(400)
            .expect({
              statusCode: 400,
              message: [
                'Código inválido',
                'Código inválido',
                'A senha deve ter no mínimo 8 caracteres, conter uma letra e um número',
              ],
              error: 'Bad Request',
            });
        });
        it("should throw passwords doesn't match", async () => {
          return await request(app.getHttpServer())
            .post('/api/users/change-password')
            .send({
              code: '000001',
              password: '12345678S',
              confirmPassword: 'a',
            })
            .expect(400)
            .expect({
              statusCode: 400,
              message: 'Senhas não coincidem',
            });
        });
      });
      it('should throw code not found', async () => {
        return await request(app.getHttpServer())
          .post('/api/users/change-password')
          .send({
            code: '040001',
            password: '12345678S',
            confirmPassword: '12345678S',
          })
          .expect(404)
          .expect({
            statusCode: 404,
            message: 'Código não encontrado',
          });
      });
      it('should change password', async () => {
        return await request(app.getHttpServer())
          .post('/api/users/change-password')
          .send({
            code: '000001',
            password: '12345678S',
            confirmPassword: '12345678S',
          })
          .expect(204);
      });
    });
  });
  afterAll(async () => {
    await request(app.getHttpServer())
      .patch(`/api/users/${user.id}`)
      .set('Authorization', 'Bearer ' + token)
      .send(user)
      .expect(200);
  });
});
