import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserModule } from '../user.module';
import { UserService } from '../user.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserResponse } from '../dto/user-response.dto';
import users from '../../../prisma/fixtures/users';
import { instanceToPlain, plainToInstance } from 'class-transformer';

describe('Users', () => {
  let token: string;
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule, AuthModule],
      providers: [UserService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'user1', password: '12345678S' })
      .expect(201);
    token = loginRes.body.access;
  });

  describe('/GET', () => {
    it('should return user', async () => {
      const userId = 1;

      return request(app.getHttpServer())
        .get(`/api/users/${userId}`)

        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .expect(instanceToPlain(plainToInstance(UserResponse, users[0])));
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
        .get('/api/users/1')
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        });
    });
    // it('should throw forbidden', async () => {
    //   return request(app.getHttpServer())
    //     .get('/api/users/10')
    //     .set('Authorization', 'Bearer ' + token)
    //     .expect(403)
    //     .expect({
    //       statusCode: 403,
    //       message: 'Você não tem permissão para isso',
    //     });
    // });
    // it('should update user', async () => {
    //   return request(app.getHttpServer())
    //     .get('/api/users/1')
    //     .set('Authorization', 'Bearer ' + token)
    //     .expect(403)
    //     .expect({
    //       statusCode: 403,
    //       message: 'Você não tem permissão para isso',
    //     });
    // });
  });
});
