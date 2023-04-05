import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { CommunityModule } from '../community.module';
import * as request from 'supertest';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { CommunityResponse } from '../dto/community-response.dto';
import communities from '../../../prisma/fixtures/communities';
import users from '../../../prisma/fixtures/users';
import { User } from '@prisma/client';

describe('Community controller', () => {
  let app: INestApplication;
  let token: string;
  let user: User;

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
    if (!user) {
      throw new Error('No user');
    }
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: user.username, password: '12345678S' })
      .expect(201);
    token = loginRes.body.access;
  });
  describe('/POST', () => {
    it('should throw unauthorized exception', async () => {
      return request(app.getHttpServer())
        .post('/api/communities/add-user')
        .expect(401)
        .send({ communityId: 1 })
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
        .expect(
          instanceToPlain(plainToInstance(CommunityResponse, communities[0])),
        );
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
          .expect([
            {
              id: 1,
              name: 'Topinar',
              subjectId: 1,
              communityChannels: [
                {
                  id: 1,
                  communityId: 1,
                  channelTypeId: 1,
                },
              ],
            },
          ]);
      });
    });
  });
});
