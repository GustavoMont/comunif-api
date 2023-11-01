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

describe('Community controller', () => {
  const BASE_URL = '/api/community-users';
  let app: INestApplication;
  let token: string;
  let user: User;
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
      imports: [CommunityUsersModule, AuthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    await app.init();
    user = users.find(({ username }) => username === 'community');

    if (!user) {
      throw new Error('No user');
    }
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: user.username, password: '12345678S' })
      .expect(201);
    token = loginRes.body.access;
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
    it.todo('should throw unauthorized');
    it.todo('should throw community was not found');
    it.todo('should throw report was not create exception');
    describe('Is not a community member', () => {
      it.todo('should throw user is not a community member');
      it.todo('should have delete report');
    });
    it.todo('should let user leave community');
  });
});
