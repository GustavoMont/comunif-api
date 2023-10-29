import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EvasionReportModule } from '../evasion-report.module';
import { AuthModule } from 'src/auth/auth.module';
import * as request from 'supertest';
import users from '../../../prisma/fixtures/users';
import { mailServiceMock } from 'src/mail/__mocks__/mail-service.mock';
import { IMailService } from 'src/mail/interfaces/IMailService';
import communities from '../../../prisma/fixtures/communities';
import { CreateUserEvasionReportDto } from '../dto/create-user-evasion-report.dto';

describe('Evasion Report', () => {
  let app: INestApplication;
  const BASE_URL = '/api/evasion-report';
  let token: string;
  const user = users.find(({ username }) => username === 'sailson');
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [EvasionReportModule, AuthModule],
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
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: user.username, password: '12345678S' });
    token = response.body.access;
  });
  describe('create report by user', () => {
    it('should throw unauthorized', async () => {
      return request(app.getHttpServer()).post(BASE_URL).expect(401);
    });
    it('should throw bad request exception', async () => {
      return request(app.getHttpServer())
        .post(BASE_URL)
        .set('Authorization', `Bearer ${token}`)
        .send({
          communityId: 'ajojakaka',
          reason: 'abc',
          userId: 'aljaaknanak',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'Inform uma comunidade válida',
            'Deve ter no mínimo 10 caracteres',
            'Informe um usuário válido',
          ],
          error: 'Bad Request',
        });
    });
    it('should throw forbidden exception', async () => {
      return request(app.getHttpServer())
        .post(BASE_URL)
        .set('Authorization', `Bearer ${token}`)
        .send({
          communityId: 2,
          userId: user.id + 10,
          reason: 'sair pq eu quis, nada a ver com a comunidade',
        })
        .expect(403);
    });
    it('should throw community not found', async () => {
      return request(app.getHttpServer())
        .post(BASE_URL)
        .set('Authorization', `Bearer ${token}`)
        .send({
          communityId: communities.at(-1).id + 100,
          userId: user.id,
          reason: 'sair pq eu quis, nada a ver com a comunidade',
        })
        .expect(404)
        .expect({ statusCode: 404, message: 'Comunidade não encontrada' });
    });
    it('should create report', async () => {
      const createData: CreateUserEvasionReportDto = {
        communityId: 2,
        userId: user.id,
        reason: 'sair pq eu quis, nada a ver com a comunidade',
      };
      return request(app.getHttpServer())
        .post(BASE_URL)
        .set('Authorization', `Bearer ${token}`)
        .send(createData)
        .expect(201)
        .then(({ body }) => {
          expect(body.reason).toBe(createData.reason);
          expect(body.userId).toBe(user.id);
          expect(body.user).toBeDefined();
          expect(body.removerId).toBe(null);
          expect(body.remover).toBe(null);
        });
    });
  });
});
