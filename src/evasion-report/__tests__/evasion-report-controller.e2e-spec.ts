import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EvasionReportModule } from '../evasion-report.module';
import { AuthModule } from 'src/auth/auth.module';
import * as request from 'supertest';
import users from '../../../prisma/fixtures/users';
import communities from '../../../prisma/fixtures/communities';
import { CreateUserEvasionReportDto } from '../dto/create-user-evasion-report.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { EvasionReportResponseDto } from '../dto/evasion-report-response.dto';
import evasionReports from '../../../prisma/fixtures/evasion-reports';
import { ListResponse } from 'src/dtos/list.dto';
import { applyEvasionReportsIncludes } from 'src/utils/tests-e2e';
import { CreateAdminEvasionReportDto } from '../dto/create-admin-evasion-report.dto';
import { ConfigModule } from '@nestjs/config';
import testEnviromentConfig from 'src/config/test-enviroment.config';

describe('Evasion Report', () => {
  let app: INestApplication;
  const BASE_URL = '/api/evasion-reports';
  let token: string;
  let adminToken: string;
  const user = users.find(({ username }) => username === 'user3');
  const admin = users.find(({ username }) => username === 'admin');
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        EvasionReportModule,
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
    let response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: user.username, password: '12345678S' });
    token = response.body.access;
    response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: admin.username, password: '4dminSenha' });
    adminToken = response.body.access;
  });
  describe('/GET', () => {
    describe('find many', () => {
      it('should throw unauthorized exception', async () => {
        return request(app.getHttpServer()).get(BASE_URL).expect(401);
      });
      it('should throw forbidden exception', async () => {
        return request(app.getHttpServer())
          .get(BASE_URL)
          .set('Authorization', `Bearer ${token}`)
          .expect(403);
      });
      it('should return list of evasion reports', async () => {
        const allCommunities = plainToInstance(
          EvasionReportResponseDto,
          applyEvasionReportsIncludes(evasionReports),
        );
        const response = new ListResponse(
          allCommunities,
          allCommunities.length,
          1,
          25,
        );
        const expectedResponse = instanceToPlain(response);
        return request(app.getHttpServer())
          .get(BASE_URL)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect(expectedResponse);
      });
      it('should return filtered list of evasion reports', async () => {
        const filteredReports = evasionReports.filter(
          ({ communityId }) => communityId === 5,
        );
        const filteredReportsResponse = plainToInstance(
          EvasionReportResponseDto,
          applyEvasionReportsIncludes(filteredReports),
        );
        const response = new ListResponse(
          filteredReportsResponse,
          filteredReportsResponse.length,
          1,
          25,
        );
        const expectedResponse = instanceToPlain(response);
        return request(app.getHttpServer())
          .get(BASE_URL)
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ community: 5 })
          .expect(200)
          .expect(expectedResponse);
      });
    });
  });
  describe('/POST', () => {
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
    describe('create report by admin', () => {
      const url = `${BASE_URL}/ban`;
      const createData: CreateAdminEvasionReportDto = {
        communityId: 2,
        reason: 'Você pipocou, você é um bananão',
        removerId: admin.id,
        userId: user.id,
      };
      it('should throw unauthorized exception', () => {
        return request(app.getHttpServer()).post(url).expect(401);
      });
      it('should throw forbidden exception', () => {
        return request(app.getHttpServer())
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .expect(403);
      });
      it('should throw bad request', () => {
        return request(app.getHttpServer())
          .post(url)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400)
          .expect({
            statusCode: 400,
            message: [
              'Necessário informar quem está removendo',
              'Necessário informar a comunidade',
              'Deve ter no mínimo 10 caracteres',
              'Necessário informar o usuário que está sendo removido',
            ],
            error: 'Bad Request',
          });
      });
      it('should throw community was not found', () => {
        return request(app.getHttpServer())
          .post(url)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...createData,
            communityId: communities.at(-1).id + 200,
          })
          .expect(404)
          .expect({
            statusCode: 404,
            message: 'Comunidade não encontrada',
          });
      });
      it('should throw user was not found', () => {
        return request(app.getHttpServer())
          .post(url)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...createData,
            userId: users.at(-1).id + 200,
          })
          .expect(404)
          .expect({
            statusCode: 404,
            message: 'Usuário não encontrado',
          });
      });
      it('should create report', () => {
        return request(app.getHttpServer())
          .post(url)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(createData)
          .expect(201)
          .then(({ body }) => {
            expect(body.reason).toEqual(createData.reason);
            expect(body.userId).toEqual(createData.userId);
            expect(body.removerId).toEqual(createData.removerId);
            expect(body.communityId).toEqual(createData.communityId);
          });
      });
    });
  });
});
