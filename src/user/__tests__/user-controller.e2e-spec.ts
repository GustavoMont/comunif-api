import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserModule } from '../user.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserResponse } from '../dto/user-response.dto';
import users from '../../../prisma/fixtures/users';
import { instanceToPlain, plainToInstance } from 'class-transformer';

describe('Users', () => {
  let token: string;
  let app: INestApplication;
  const user = users.find(({ username }) => username === 'editavel');
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, AuthModule],
      providers: [],
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

  afterAll(async () => {
    await request(app.getHttpServer())
      .patch(`/api/users/${user.id}`)
      .set('Authorization', 'Bearer ' + token)
      .send(user)
      .expect(200);
  });
});
