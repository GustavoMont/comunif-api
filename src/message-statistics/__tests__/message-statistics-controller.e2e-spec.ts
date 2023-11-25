import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import users from '../../../prisma/fixtures/users';
import { RoleEnum } from 'src/models/User';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ListResponse } from 'src/dtos/list.dto';
import * as moment from 'moment';
import { ConfigModule } from '@nestjs/config';
import testEnviromentConfig from 'src/config/test-enviroment.config';
import { MessageStatisticsModule } from '../message-statistics.module';
import { MessageStatisticsDto } from '../dto/message-statistics.dto';
import messageStatistics from '../../../prisma/fixtures/message-statistics';

describe('Message statistics', () => {
  let app: INestApplication;
  const admin = users.find(({ username }) => username === 'admin');
  const user = users.find(({ role }) => role === RoleEnum.user);
  const baseUrl = '/api/message-statistics';
  let adminToken: string;
  let userToken: string;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MessageStatisticsModule,
        AuthModule,
        ConfigModule.forRoot({
          load: [testEnviromentConfig],
          isGlobal: true,
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
    let loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: admin.username, password: '4dminSenha' });
    adminToken = loginResponse.body.access;
    loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: user.username, password: '12345678S' });
    userToken = loginResponse.body.access;
  });
  describe('/GET', () => {
    describe('messages count', () => {
      it('should throw unauthorized', async () => {
        return request(app.getHttpServer()).get(`${baseUrl}/count`).expect(401);
      });
      it('should throw forbidden', async () => {
        return request(app.getHttpServer())
          .get(`${baseUrl}/count`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });
      it('should return month messages count', async () => {
        return request(app.getHttpServer())
          .get(`${baseUrl}/count`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect({ total: 0 });
      });
    });
    describe('message statistics', () => {
      it('should throw unauthorized', async () => {
        return request(app.getHttpServer()).get(`${baseUrl}`).expect(401);
      });
      it('should throw forbidden', async () => {
        return request(app.getHttpServer())
          .get(`${baseUrl}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });
      it('should return last two months statistics', async () => {
        const messageStatisticResponse = plainToInstance(
          MessageStatisticsDto,
          messageStatistics.map((cs) => ({ ...cs, user: null })),
        );
        const expectedResponse = new ListResponse(
          messageStatisticResponse,
          messageStatistics.length,
          1,
          25,
        );
        return request(app.getHttpServer())
          .get(`${baseUrl}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect(instanceToPlain(expectedResponse));
      });
      it('should return by query filters', async () => {
        const expectedResponse = new ListResponse([], 0, 1, 25);
        return request(app.getHttpServer())
          .get(`${baseUrl}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .query({
            from: moment().add(2, 'months').toDate(),
            to: moment().add(4, 'months').toDate(),
          })
          .expect(200)
          .expect(instanceToPlain(expectedResponse));
      });
    });
  });
  describe('/POST', () => {
    describe('create message statistics', () => {
      it('should throw unauthorized', () => {
        return request(app.getHttpServer()).post(baseUrl).expect(401);
      });
      it('should throw forbidden', () => {
        return request(app.getHttpServer())
          .post(baseUrl)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });
      it('should create statistics', () => {
        const expectedCount = 0;
        return request(app.getHttpServer())
          .post(baseUrl)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(201)
          .expect(({ body }) => {
            expect(body.count).toBe(expectedCount);
            expect(body.userId).toBe(admin.id);
          });
      });
      it('should throw bad request', () => {
        return request(app.getHttpServer())
          .post(baseUrl)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400)
          .expect({
            statusCode: 400,
            message: 'As estatísticas desse mês já foram geradas',
          });
      });
    });
  });
});
