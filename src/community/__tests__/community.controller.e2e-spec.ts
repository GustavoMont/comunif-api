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

describe('Community controller', () => {
  let app: INestApplication;
  let token: string;
  let user: User;
  let admin: User;
  const community = communities.find(({ id }) => id === 1);
  const allComunities = communities.map<CommunityResponse>((community) =>
    plainToInstance(CommunityResponse, {
      ...community,
      communityChannels: communitiesChannels.filter(
        ({ communityId }) => communityId === community.id,
      ),
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
      }),
    );
    await app.init();
    user = users.find(({ username }) => username === 'community');
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
    it('should throw unauthorized exception', async () => {
      return request(app.getHttpServer())
        .post('/api/communities/add-user')
        .expect(401)
        .send({ communityId: community.id })
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        });
    });
    it('should throw bad request', async () => {
      return request(app.getHttpServer())
        .post('/api/communities/add-user')
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
        .post('/api/communities/add-user')
        .send({ communityId: 1 })
        .set('Authorization', 'Bearer ' + token)
        .expect(201)
        .expect(instanceToPlain(allComunities[0]));
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
        return request(app.getHttpServer())
          .get('/api/communities')
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .expect(instanceToPlain(activeCommunities));
      });
      it('should return all communities', async () => {
        return request(app.getHttpServer())
          .get('/api/communities')
          .set('Authorization', 'Bearer ' + adminToken)
          .expect(200)
          .expect(instanceToPlain(allComunities));
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
        .expect((res) => {
          return (
            res.body.name === changes.name &&
            res.body.isActive === changes.isActive
          );
        });
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
