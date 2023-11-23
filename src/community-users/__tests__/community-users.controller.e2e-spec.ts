import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import * as request from 'supertest';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import communities from '../../../prisma/fixtures/communities';
import users from '../../../prisma/fixtures/users';
import { User } from '@prisma/client';
import communitiesChannels from '../../../prisma/fixtures/community-channels';
import channelTypes from '../../../prisma/fixtures/channel-types';
import {
  getCommunityMembers,
  includeCommunityChannels,
} from '../../utils/tests-e2e';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { CommunityUsersModule } from '../community-users.module';
import { ListResponse } from 'src/dtos/list.dto';
import communityHasUsers from '../../../prisma/fixtures/community-has-users';
import { UserResponse } from 'src/user/dto/user-response.dto';
import { IMailService } from 'src/mail/interfaces/IMailService';
import { mailServiceMock } from 'src/mail/__mocks__/mail-service.mock';
import { ConfigModule } from '@nestjs/config';
import testEnviromentConfig from 'src/config/test-enviroment.config';

describe('Community controller', () => {
  const BASE_URL = '/api/community-users';
  let app: INestApplication;
  let token: string;
  let leaveUserToken: string;
  let adminToken: string;
  let noCommunityUserToken: string;
  let user: User;
  const admin = users.find(({ id }) => id === 1);
  const leaveUser = users.find(({ username }) => username === 'sailson');
  const bannedUser = users.find(({ username }) => username === 'banido');
  const noCommunityUser = users.find(
    ({ username }) => username === 'sem_comunidade',
  );
  const community = communities.find(({ id }) => id === 1);
  const communityMembers = getCommunityMembers({
    communityHasUsers,
    users,
    communityId: 1,
  });
  const allComunities = communities.map<CommunityResponse>((community) =>
    plainToInstance(CommunityResponse, {
      ...community,
      communityChannels: includeCommunityChannels({
        channelTypes,
        communitiesChannels,
        currentCommunityId: community.id,
      }),
    } as CommunityResponse),
  );

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        CommunityUsersModule,
        AuthModule,
        ConfigModule.forRoot({
          load: [testEnviromentConfig],
          isGlobal: true,
        }),
      ],
    })
      .overrideProvider(IMailService)
      .useValue(mailServiceMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
    user = users.find(({ username }) => username === 'community');

    if (!user) {
      throw new Error('No user');
    }
    let loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: user.username, password: '12345678S' })
      .expect(201);
    token = loginRes.body.access;
    loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: leaveUser.username, password: '12345678S' })
      .expect(201);
    leaveUserToken = loginRes.body.access;
    loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: noCommunityUser.username, password: '12345678S' })
      .expect(201);
    noCommunityUserToken = loginRes.body.access;
    loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: admin.username, password: '4dminSenha' })
      .expect(201);
    adminToken = loginRes.body.access;
  });
  describe('/GET', () => {
    describe('list community memeber', () => {
      const route = '/api/community-users/1/members';
      it('should throw unauthorized exception', async () => {
        return request(app.getHttpServer())
          .get(route)
          .expect(401)
          .send({ communityId: community.id })
          .expect({
            statusCode: 401,
            message: 'Unauthorized',
          });
      });
      it('should throw community not found', () => {
        return request(app.getHttpServer())
          .get(`${BASE_URL}/100/members`)
          .set('Authorization', 'Bearer ' + token)
          .expect(404)
          .expect({
            statusCode: 404,
            message: 'Comunidade não encontrada',
          });
      });
      it('should list communities active members', () => {
        const expectedResponse = new ListResponse<UserResponse>(
          plainToInstance(UserResponse, communityMembers),
          communityMembers.length,
          1,
          20,
        );
        return request(app.getHttpServer())
          .get(route)
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .expect(instanceToPlain(expectedResponse));
      });
    });
  });
  describe('/POST', () => {
    describe('add user in community', () => {
      it('should throw unauthorized exception', async () => {
        return request(app.getHttpServer())
          .post('/api/community-users')
          .expect(401)
          .send({ communityId: community.id })
          .expect({
            statusCode: 401,
            message: 'Unauthorized',
          });
      });
      it('should throw bad request', async () => {
        return request(app.getHttpServer())
          .post('/api/community-users')
          .send({})
          .set('Authorization', 'Bearer ' + token)
          .expect(400)
          .expect({
            statusCode: 400,
            message: ['Deve ser um número', 'A comunidade deve ser informada'],
            error: 'Bad Request',
          });
      });
      it('should add user on community', async () => {
        return request(app.getHttpServer())
          .post('/api/community-users')
          .send({ communityId: 1 })
          .set('Authorization', 'Bearer ' + token)
          .expect(201)
          .expect(instanceToPlain({ ...allComunities[0], isMember: true }));
      });
    });
  });
  describe('/DELETE', () => {
    describe('user leave community', () => {
      const url = `${BASE_URL}/5/members/${leaveUser.id}`;
      it('should throw unauthorized', async () => {
        return request(app.getHttpServer()).delete(url).expect(401);
      });
      it('should throw community was not found', async () => {
        return request(app.getHttpServer())
          .delete(
            `${BASE_URL}/${communities.at(-1).id + 200}/members/${
              leaveUser.id
            }`,
          )
          .set('Authorization', `Bearer ${leaveUserToken}`)
          .expect(404)
          .expect({
            statusCode: 404,
            message: 'Comunidade não encontrada',
          });
      });
      it('should throw report was not create exception', async () => {
        return request(app.getHttpServer())
          .delete(`${BASE_URL}/5/members/${user.id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(400)
          .expect({
            statusCode: 400,
            message: 'Relatório de evasão não foi gerado',
          });
      });
      describe('Is not a community member', () => {
        const url = `${BASE_URL}/2/members/${noCommunityUser.id}`;
        beforeAll(async () => {
          return await request(app.getHttpServer())
            .post('/api/evasion-reports')
            .set('Authorization', `Bearer ${noCommunityUserToken}`)
            .send({
              communityId: 2,
              userId: noCommunityUser.id,
            })
            .expect(201);
        });
        it('should throw user is not a community member', async () => {
          return request(app.getHttpServer())
            .delete(url)
            .set('Authorization', `Bearer ${noCommunityUserToken}`)
            .expect(400)
            .expect({
              statusCode: 400,
              message: 'Usuário não faz parte dessa comunidade',
            });
        });
        it('should have delete report', async () => {
          return request(app.getHttpServer())
            .delete(url)
            .set('Authorization', `Bearer ${noCommunityUserToken}`)
            .expect(400)
            .expect({
              statusCode: 400,
              message: 'Relatório de evasão não foi gerado',
            });
        });
      });
      it('should let user leave community', async () => {
        return request(app.getHttpServer())
          .delete(url)
          .set('Authorization', `Bearer ${leaveUserToken}`)
          .expect(204);
      });
    });
    describe('user got banned', () => {
      const url = `${BASE_URL}/5/members/${bannedUser.id}`;
      it('should throw unauthorized', () => {
        return request(app.getHttpServer()).delete(url).expect(401);
      });
      it('should throw forbidden', () => {
        return request(app.getHttpServer())
          .delete(url)
          .set('Authorization', `Bearer ${token}`)
          .expect(403);
      });
      it('should throw community was not found', () => {
        return request(app.getHttpServer())
          .delete(
            `${BASE_URL}/${communities.at(-1).id + 200}/members/${
              bannedUser.id
            }`,
          )
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404)
          .expect({
            statusCode: 404,
            message: 'Comunidade não encontrada',
          });
      });
      it('should throw report was not created', async () => {
        return request(app.getHttpServer())
          .delete(`${BASE_URL}/5/members/${user.id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(400)
          .expect({
            statusCode: 400,
            message: 'Relatório de evasão não foi gerado',
          });
      });
      describe('Is not a community member', () => {
        const url = `${BASE_URL}/2/members/${noCommunityUser.id}`;
        beforeAll(async () => {
          return await request(app.getHttpServer())
            .post('/api/evasion-reports/ban')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
              communityId: 2,
              userId: noCommunityUser.id,
              reason: 'Chaaaato dms',
              removerId: admin.id,
            })
            .expect(201);
        });
        it('should throw user is not a community member', async () => {
          return request(app.getHttpServer())
            .delete(url)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(400)
            .expect({
              statusCode: 400,
              message: 'Usuário não faz parte dessa comunidade',
            });
        });
      });
      it('should ban user from community', () => {
        return request(app.getHttpServer())
          .delete(url)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);
      });
    });
  });
});
