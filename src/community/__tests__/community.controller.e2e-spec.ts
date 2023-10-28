import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { CommunityModule } from '../community.module';
import * as request from 'supertest';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { CommunityResponse } from '../dto/community-response.dto';
import { CommunityUpdate } from '../dto/community-update.dto';
import communities from '../../../prisma/fixtures/communities';
import users from '../../../prisma/fixtures/users';
import { User } from '@prisma/client';
import communitiesChannels from '../../../prisma/fixtures/community-channels';
import { ListResponse } from 'src/dtos/list.dto';
import channelTypes from '../../../prisma/fixtures/channel-types';
import { includeCommunityChannels } from '../../utils/tests-e2e';

describe('Community controller', () => {
  let app: INestApplication;
  let token: string;
  let user: User;
  let admin: User;
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
  const activeCommunities = allComunities.filter(({ isActive }) => isActive);
  const editableCommunity = communities.find(({ name }) => name === 'Editores');
  let adminToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CommunityModule, AuthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
    user = users.find(({ username }) => username === 'user1');
    admin = users.find(({ username }) => username === 'admin');

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
      .send({ username: admin.username, password: '4dminSenha' })
      .expect(201);
    adminToken = loginRes.body.access;
  });
  describe('/POST', () => {
    describe('create community', () => {
      let communityId: number;
      it('throw unauthorized', async () => {
        return request(app.getHttpServer())
          .post('/api/communities/')
          .expect(401)
          .expect({
            statusCode: 401,
            message: 'Unauthorized',
          });
      });
      it('throw forbidden', async () => {
        return request(app.getHttpServer())
          .patch(`/api/communities/${editableCommunity.id}`)
          .set('Authorization', 'Bearer ' + token)
          .expect(403);
      });
      it('throw bad request exception', async () => {
        return request(app.getHttpServer())
          .post(`/api/communities`)
          .set('Authorization', 'Bearer ' + adminToken)
          .send({})
          .expect(400)
          .expect({
            statusCode: 400,
            message: [
              'Nome deve conter no mínimo 3 letras',
              'Assunto deve conter no mínimo 3 letras',
            ],
            error: 'Bad Request',
          });
      });
      it('should create community', async () => {
        const bodyData = { name: 'New community', subject: 'subject' };
        return request(app.getHttpServer())
          .post(`/api/communities`)
          .set('Authorization', 'Bearer ' + adminToken)
          .send(bodyData)
          .expect(201)
          .expect(({ body }) => {
            communityId = body.id;
            return (
              body.name === bodyData.name && body.subject === bodyData.subject
            );
          });
      });
      afterAll(async () => {
        return request(app.getHttpServer())
          .delete(`/api/communities/${communityId}`)
          .set('Authorization', 'Bearer ' + adminToken)
          .expect(204);
      });
    });
  });
  describe('/GET', () => {
    describe('find user communities', () => {
      it('should throw unauthorizated exception', async () => {
        return request(app.getHttpServer())
          .get('/api/communities/users/1')
          .expect(401)
          .expect({
            statusCode: 401,
            message: 'Unauthorized',
          });
      });
      it('should return user communities', async () => {
        return request(app.getHttpServer())
          .get(`/api/communities/users/${user.id}`)
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .expect(instanceToPlain([allComunities[0]]));
      });
    });
    describe('find all communities', () => {
      it('should throw unauthorized exception', async () => {
        return request(app.getHttpServer())
          .get('/api/communities')
          .expect(401)
          .expect({
            statusCode: 401,
            message: 'Unauthorized',
          });
      });
      it('should return only active communities', async () => {
        const expectedResponse = new ListResponse<CommunityResponse>(
          activeCommunities,
          activeCommunities.length,
          1,
          20,
        );
        return request(app.getHttpServer())
          .get('/api/communities')
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .expect(instanceToPlain(expectedResponse));
      });
      it('should return all communities', async () => {
        const communitiesWithIsMember = allComunities.map((community) => ({
          ...community,
          isMember: false,
        }));
        const expectedResponse = new ListResponse<CommunityResponse>(
          communitiesWithIsMember,
          allComunities.length,
          1,
          20,
        );

        return request(app.getHttpServer())
          .get('/api/communities')
          .set('Authorization', 'Bearer ' + adminToken)
          .expect(200)
          .expect(instanceToPlain(expectedResponse));
      });
      it('should return just one community', async () => {
        const firstCommunity = allComunities[0];
        let expectedResponse = new ListResponse<CommunityResponse>(
          [
            {
              ...firstCommunity,
              isMember: false,
            },
          ],
          allComunities.length,
          1,
          1,
        );

        await request(app.getHttpServer())
          .get('/api/communities?take=1')
          .set('Authorization', 'Bearer ' + adminToken)
          .expect(200)
          .expect(instanceToPlain(expectedResponse));
        const secondCommunity = allComunities[1];
        expectedResponse = new ListResponse<CommunityResponse>(
          [
            {
              ...secondCommunity,
              isMember: false,
            },
          ],
          allComunities.length,
          2,
          1,
        );
        return request(app.getHttpServer())
          .get('/api/communities?take=1&page=2')
          .set('Authorization', 'Bearer ' + adminToken)
          .expect(200)
          .expect(instanceToPlain(expectedResponse));
      });
    });
  });
  describe('/PATCH', () => {
    it('should throw not unauthorized exception', async () => {
      return request(app.getHttpServer())
        .patch(`/api/communities/${editableCommunity.id}`)
        .expect(401);
    });
    it('should throw forbidden exception', async () => {
      return request(app.getHttpServer())
        .patch(`/api/communities/${editableCommunity.id}`)
        .set('Authorization', 'Bearer ' + token)
        .expect(403);
    });
    it('should throw bad request', async () => {
      return request(app.getHttpServer())
        .patch(`/api/communities/${editableCommunity.id}`)
        .set('Authorization', 'Bearer ' + adminToken)
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['Nome deve conter no mínimo 3 letras'],
          error: 'Bad Request',
        });
    });
    it('should throw not found', async () => {
      return request(app.getHttpServer())
        .patch(`/api/communities/1000`)
        .set('Authorization', 'Bearer ' + adminToken)
        .send({ name: 'nome' })
        .expect(404);
    });
    it('should update community', async () => {
      const changes = {
        name: 'Mudei',
        isActive: true,
      } as CommunityUpdate;
      return request(app.getHttpServer())
        .patch(`/api/communities/${editableCommunity.id}`)
        .set('Authorization', 'Bearer ' + adminToken)
        .send(changes)
        .expect(200)
        .then((res) => {
          expect(res.body.name).toEqual(changes.name);
          expect(res.body.isActive).toEqual(changes.isActive);
        });
    });
  });
  describe('/DELETE', () => {
    let communityId: number;
    beforeAll(async () => {
      return request(app.getHttpServer())
        .post(`/api/communities`)
        .set('Authorization', 'Bearer ' + adminToken)
        .send({ name: 'deletada', subject: 'deletação' })
        .expect(201)
        .expect(({ body }) => {
          communityId = body.id;
        });
    });
    it('should throw unauthorized', async () => {
      return request(app.getHttpServer())
        .delete(`/api/communities/${communityId}`)
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        });
    });

    it('should throw forbidden', async () => {
      return request(app.getHttpServer())
        .delete(`/api/communities/${communityId}`)
        .set('Authorization', 'Bearer ' + token)
        .expect(403);
    });
    it('should throw not found', async () => {
      return request(app.getHttpServer())
        .delete(`/api/communities/${communityId}00`)
        .set('Authorization', 'Bearer ' + adminToken)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Comunidade não encontrada',
        });
    });
    it('should delete community', async () => {
      return request(app.getHttpServer())
        .delete(`/api/communities/${communityId}`)
        .set('Authorization', 'Bearer ' + adminToken)
        .expect(204);
    });
  });
  afterAll(async () => {
    return request(app.getHttpServer())
      .patch(`/api/communities/${editableCommunity.id}`)
      .set('Authorization', 'Bearer ' + adminToken)
      .send(editableCommunity)
      .expect(200);
  });
});
