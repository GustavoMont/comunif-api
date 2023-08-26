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
import { includeCommunityChannels } from '../../utils/tests-e2e';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { CommunityUsersModule } from '../community-users.module';

describe('Community controller', () => {
  let app: INestApplication;
  let token: string;
  let user: User;
  const community = communities.find(({ id }) => id === 1);
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
});
