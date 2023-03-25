import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { CommunityModule } from '../community.module';
import * as request from 'supertest';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { CommunityResponse } from '../dto/community-response.dto';
import communities from '../../../prisma/fixtures/communities';

describe('Community controller', () => {
  let app: INestApplication;
  let token: string;

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

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'community', password: '12345678S' })
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
});
