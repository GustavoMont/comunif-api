import { Injectable, Logger } from '@nestjs/common';
import { IFileService } from './interfaces/IFileService';
import { ConfigService } from '@nestjs/config';
import { Enviroment } from 'src/config/enviroment';
import {
  FirebaseStorage,
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { access, readFile, unlink } from 'fs/promises';
import { resolve } from 'path';

@Injectable()
export class FileService implements IFileService {
  private logger: Logger = new Logger('FileService');
  private isProd: boolean;
  private domain = this.configService.getOrThrow('domain');
  private storage: FirebaseStorage;
  constructor(private readonly configService: ConfigService<Enviroment, true>) {
    const firebaseConfig = configService.getOrThrow('bucket');
    const app = initializeApp(firebaseConfig);
    this.storage = getStorage(app);
    this.isProd = configService.get('enviroment', 'local') === 'production';
  }
  getFilePath(filePath: string): string {
    return resolve('uploads', filePath);
  }
  async uploadFile(filePath: string): Promise<string> {
    try {
      if (this.isProd) {
        const imageRef = ref(this.storage, filePath);
        const path = this.getFilePath(filePath);
        const file = await readFile(path);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        unlink(path);
        return url;
      }
      const fileUrl = `${this.domain}/public/${filePath}`;
      return fileUrl;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await access(this.getFilePath(filePath));
      return true;
    } catch {
      return false;
    }
  }

  extractFileFolder(fileUrl: string): string {
    if (this.isProd) {
      const [storageFilePath] = fileUrl.split('o/')[1].split('?');
      return storageFilePath.replace(/%2F/gi, '/');
    }
    return fileUrl.replace(`${this.domain}/public/`, '');
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileFolder = this.extractFileFolder(fileUrl);
      const filePath = this.getFilePath(fileFolder);
      const fileExists = await this.fileExists(filePath);
      if (fileExists) {
        await unlink(filePath);
      }
      if (this.isProd) {
        const imageRef = ref(this.storage, fileUrl);
        deleteObject(imageRef);
      }
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
