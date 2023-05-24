import { Test } from '@nestjs/testing';
import { AuthModule } from '../auth.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import users from '../../../prisma/fixtures/users';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';

describe('Auth', () => {
  let app: INestApplication;
  const baseUrl = 'api/auth';
  let hashedEmail: string;
  let token: string;
  const user = users.find(({ id }) => id !== 7 && id !== 1);
  const passwordUser = users.find(({ username }) => username === 'password');
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(MailService)
      .useValue({
        resetPassword: jest.fn(),
        passwordUpdated: jest.fn(),
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    await app.init();
  });
  describe('/POST', () => {
    describe('reset password', () => {
      it('should throw invalid email', async () => {
        return request(app.getHttpServer())
          .post(`/${baseUrl}/reset-password`)
          .send({
            email: 'aooahliafyjfav',
          })
          .expect(400)
          .expect({
            statusCode: 400,
            message: ['Insira um e-mail válido'],
            error: 'Bad Request',
          });
      });
      it('should throw email not found', () => {
        return request(app.getHttpServer())
          .post(`/${baseUrl}/reset-password`)
          .send({
            email: 'naoexist@email.com',
          })
          .expect(404)
          .expect({
            statusCode: 404,
            message: 'E-mail não encontrado',
          });
      });
      it('should send code to email', async () => {
        return request(app.getHttpServer())
          .post(`/${baseUrl}/reset-password`)
          .send({
            email: user.email,
          })
          .expect(201)
          .expect(({ body }) => {
            const { email } = body;
            hashedEmail = email;
            return bcrypt.compareSync(user.email, email);
          });
      });
    });
    describe('confirm code', () => {
      describe('Inavlid code', () => {
        it('should throw code invalid when code problems', async () => {
          return request(app.getHttpServer())
            .post(`/${baseUrl}/reset-password/confirm-code`)
            .send({
              code: 'ahbaiao',
              email: hashedEmail,
            })
            .expect(400)
            .expect({
              statusCode: 400,
              message: ['Código inválido', 'Código inválido'],
              error: 'Bad Request',
            });
        });
        it('should throw invalid code when email does not match', async () => {
          return request(app.getHttpServer())
            .post(`/${baseUrl}/reset-password/confirm-code`)
            .send({
              code: '000001',
              email: 'aijioahguafjakagkav',
            })
            .expect(400)
            .expect({
              statusCode: 400,
              message: 'Código inválido',
            });
        });
      });
      it('should throw code expired', async () => {
        return request(app.getHttpServer())
          .post(`/${baseUrl}/reset-password/confirm-code`)
          .send({
            code: '000002',
            email: 'AAAAAAAAAAAA',
          })
          .expect(400)
          .expect({
            statusCode: 400,
            message: 'Esse código já expirou',
          });
      });
      it('should confirm code and response token', async () => {
        const email = await bcrypt.hash(passwordUser.email, 10);
        return request(app.getHttpServer())
          .post(`/${baseUrl}/reset-password/confirm-code`)
          .send({
            code: '000001',
            email,
          })
          .expect(200)
          .expect(({ body }) => {
            token = body.access;
            return !!body.access;
          });
      });
    });
    describe('change password', () => {
      it('should throw anauthorized', async () => {
        return request(app.getHttpServer())
          .post(`/${baseUrl}/change-password`)
          .expect(401);
      });
      it('should throw weak passwords', async () => {
        return request(app.getHttpServer())
          .post(`/${baseUrl}/change-password`)
          .set('Authorization', 'Bearer ' + token)
          .expect(400)
          .expect({
            statusCode: 400,
            message: [
              'A senha deve ter no mínimo 8 caracteres, conter uma letra e um número',
            ],
            error: 'Bad Request',
          });
      });
      it('should throw passwords do not match', async () => {
        return request(app.getHttpServer())
          .post(`/${baseUrl}/change-password`)
          .set('Authorization', 'Bearer ' + token)
          .send({
            password: 'S3nhasenha',
            confirmPassword: 'aakpajoahia',
          })
          .expect(400)
          .expect({
            statusCode: 400,
            message: 'Senhas não coincidem',
          });
      });
      it('should change password', async () => {
        return request(app.getHttpServer())
          .post(`/${baseUrl}/change-password`)
          .set('Authorization', 'Bearer ' + token)
          .send({
            password: 'S3nhasenha',
            confirmPassword: 'S3nhasenha',
          })
          .expect(204);
      });
    });
  });
});
