import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import users from '../../../prisma/fixtures/users';
import { RoleEnum } from 'src/models/User';
import communities from '../../../prisma/fixtures/communities';
import { CommunityStatisticsModule } from '../community-statistics.module';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { CommunityStatisticsDto } from '../dto/community-statistics.dto';
import communityStatistics from '../../../prisma/fixtures/community-statistics';
import { ListResponse } from 'src/dtos/list.dto';
import * as moment from 'moment';

describe('User statistics', () => {
  let app: INestApplication;
  const admin = users.find(({ username }) => username === 'admin');
  const user = users.find(({ role }) => role === RoleEnum.user);
  const activeCommunities = communities.filter(({ isActive }) => isActive);
  const baseUrl = '/api/community-statistics';
  let adminToken: string;
  let userToken: string;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CommunityStatisticsModule, AuthModule],
      providers: [],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
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
    describe('communities count', () => {
      it('should throw unauthorized', async () => {
        return request(app.getHttpServer()).get(`${baseUrl}/count`).expect(401);
      });
      it('should throw forbidden', async () => {
        return request(app.getHttpServer())
          .get(`${baseUrl}/count`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });
      it('should return active communities count', async () => {
        return request(app.getHttpServer())
          .get(`${baseUrl}/count`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect({ total: activeCommunities.length });
      });
    });
    describe('community statistics', () => {
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
        const communityStatisticResponse = plainToInstance(
          CommunityStatisticsDto,
          communityStatistics.map((cs) => ({ ...cs, user: null })),
        );
        const expectedResponse = new ListResponse(
          communityStatisticResponse,
          communityStatistics.length,
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
});