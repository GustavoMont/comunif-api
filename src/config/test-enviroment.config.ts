import { Enviroment } from './enviroment';

export default (): Enviroment => ({
  bucket: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
  cors: {
    origins: ['https://localhost:3000'],
  },
  domain: 'https://localhost:3000',
  email: {
    address: 'email@email.com',
    host: 'host.smtp.com',
    password: 'password',
    port: 587,
  },
  enviroment: 'test',
  jwtSecret: 'test_secret_jwt',
  port: 3000,
});
