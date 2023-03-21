import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IUserService } from '../src/user/interfaces/IUserService';
import { UserModule } from '../src/user/user.module';
import { UserService } from '../src/user/user.service';

describe('User', () => {
  let app: INestApplication;
  const userService: IUserService = {
    findById(id) {
      return Promise.resolve({
        birthday: new Date(),
        email: 'email@email.com',
        id,
        lastName: 'lastName',
        name: 'Name',
        password: 'password',
        username: 'username',
      });
    },
  };
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(UserService)
      .useValue(userService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/GET users', () => {
    return request(app.getHttpServer())
      .get('/api/users')
      .expect(200)
      .expect({
        data: userService.findById(10),
      });
  });
});
