export interface Enviroment {
  port: number;
  domain: string;
  enviroment: 'local' | 'development' | 'production' | 'test';
  jwtSecret: string;
  cors: Cors;
  email: Email;
  bucket: FirebaseStorage;
}

interface Cors {
  origins: string[];
}

interface Email {
  address: string;
  password: string;
  port: number;
  host: string;
}

interface FirebaseStorage {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export default (): Enviroment => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  domain: process.env.DOMAIN ?? 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET,
  enviroment: (process.env.ENVIROMENT as any) ?? 'production',
  cors: {
    origins: [process.env.CLIENT_WEB],
  },
  email: {
    address: process.env.EMAIL_ADDRESS,
    password: process.env.EMAIL_PASSWORD,
    port: Number(process.env.EMAIL_PORT),
    host: process.env.EMAIL_HOST,
  },
  bucket: {
    apiKey: process.env.FIREBASE_APP_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  },
});
